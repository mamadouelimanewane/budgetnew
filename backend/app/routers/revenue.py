from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import Integer, String, DateTime, func, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from app.audit import append_audit_event
from app.db import Base
from app.deps import get_db
from app.models import User
from app.routers.auth import get_current_user


class Revenue(Base):
    __tablename__ = "revenues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fiscal_year: Mapped[int] = mapped_column(Integer, index=True)
    org_unit: Mapped[str] = mapped_column(String(120), index=True)
    account: Mapped[str] = mapped_column(String(80), index=True)
    label: Mapped[str] = mapped_column(String(255), default="")
    amount_xof: Mapped[int] = mapped_column(Integer)
    period: Mapped[str] = mapped_column(String(20), default="monthly")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


router = APIRouter(tags=["revenue"])


class RevenueIn(BaseModel):
    fiscal_year: int = Field(ge=1900, le=3000)
    org_unit: str = Field(min_length=1, max_length=120)
    account: str = Field(min_length=1, max_length=80)
    label: str = Field(default="", max_length=255)
    amount_xof: int = Field(ge=0)
    period: str = Field(default="monthly", max_length=20)


class RevenueOut(RevenueIn):
    id: int


@router.post("/", response_model=RevenueOut)
def create_revenue(
    payload: RevenueIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> RevenueOut:
    r = Revenue(**payload.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    append_audit_event(db=db, actor_user_id=user.id, action="create", entity="Revenue", entity_id=str(r.id), details=payload.model_dump())
    return RevenueOut(id=r.id, **payload.model_dump())


@router.get("/", response_model=list[RevenueOut])
def list_revenues(
    fiscal_year: int | None = None,
    org_unit: str | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[RevenueOut]:
    stmt = select(Revenue).order_by(Revenue.id.desc()).limit(500)
    if fiscal_year is not None:
        stmt = stmt.where(Revenue.fiscal_year == fiscal_year)
    if org_unit is not None:
        stmt = stmt.where(Revenue.org_unit == org_unit)
    rows = db.scalars(stmt).all()
    return [
        RevenueOut(
            id=x.id,
            fiscal_year=x.fiscal_year,
            org_unit=x.org_unit,
            account=x.account,
            label=x.label,
            amount_xof=x.amount_xof,
            period=x.period,
        )
        for x in rows
    ]

