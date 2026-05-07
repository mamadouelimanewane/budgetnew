from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.deps import get_db
from app.models import BudgetLine, BudgetPlan, BudgetAllocation
from app.routers.auth import get_current_user
from app.models import User


router = APIRouter(tags=["budget"])


class BudgetLineIn(BaseModel):
    code: str = Field(min_length=1, max_length=80)
    label: str = Field(default="", max_length=255)
    level: int = Field(default=4, ge=1, le=10)


class BudgetLineOut(BudgetLineIn):
    id: int


class BudgetPlanIn(BaseModel):
    fiscal_year: int = Field(ge=1900, le=3000)
    name: str = Field(default="Budget", max_length=200)


class BudgetPlanOut(BudgetPlanIn):
    id: int


class AllocationIn(BaseModel):
    budget_plan_id: int
    budget_line_id: int
    org_unit: str = Field(min_length=1, max_length=120)
    amount_xof: int = Field(ge=0)
    period: str = Field(default="annual", max_length=20)


class AllocationOut(AllocationIn):
    id: int


@router.post("/lines", response_model=BudgetLineOut)
def create_line(
    payload: BudgetLineIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BudgetLineOut:
    line = BudgetLine(code=payload.code, label=payload.label, level=payload.level)
    db.add(line)
    db.commit()
    db.refresh(line)
    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="create",
        entity="BudgetLine",
        entity_id=str(line.id),
        details={"code": line.code, "label": line.label, "level": line.level},
    )
    return BudgetLineOut(id=line.id, code=line.code, label=line.label, level=line.level)


@router.get("/lines", response_model=list[BudgetLineOut])
def list_lines(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[BudgetLineOut]:
    rows = db.scalars(select(BudgetLine).order_by(BudgetLine.code)).all()
    return [BudgetLineOut(id=r.id, code=r.code, label=r.label, level=r.level) for r in rows]


@router.post("/plans", response_model=BudgetPlanOut)
def create_plan(
    payload: BudgetPlanIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BudgetPlanOut:
    plan = BudgetPlan(fiscal_year=payload.fiscal_year, name=payload.name)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="create",
        entity="BudgetPlan",
        entity_id=str(plan.id),
        details={"fiscal_year": plan.fiscal_year, "name": plan.name},
    )
    return BudgetPlanOut(id=plan.id, fiscal_year=plan.fiscal_year, name=plan.name)


@router.get("/plans", response_model=list[BudgetPlanOut])
def list_plans(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[BudgetPlanOut]:
    rows = db.scalars(select(BudgetPlan).order_by(BudgetPlan.fiscal_year.desc())).all()
    return [BudgetPlanOut(id=r.id, fiscal_year=r.fiscal_year, name=r.name) for r in rows]


@router.post("/allocations", response_model=AllocationOut)
def create_allocation(
    payload: AllocationIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AllocationOut:
    if not db.get(BudgetPlan, payload.budget_plan_id):
        raise HTTPException(status_code=404, detail="Budget plan not found")
    if not db.get(BudgetLine, payload.budget_line_id):
        raise HTTPException(status_code=404, detail="Budget line not found")
    a = BudgetAllocation(
        budget_plan_id=payload.budget_plan_id,
        budget_line_id=payload.budget_line_id,
        org_unit=payload.org_unit,
        amount_xof=payload.amount_xof,
        period=payload.period,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="create",
        entity="BudgetAllocation",
        entity_id=str(a.id),
        details={
            "budget_plan_id": a.budget_plan_id,
            "budget_line_id": a.budget_line_id,
            "org_unit": a.org_unit,
            "amount_xof": a.amount_xof,
            "period": a.period,
        },
    )
    return AllocationOut(
        id=a.id,
        budget_plan_id=a.budget_plan_id,
        budget_line_id=a.budget_line_id,
        org_unit=a.org_unit,
        amount_xof=a.amount_xof,
        period=a.period,
    )


@router.get("/allocations", response_model=list[AllocationOut])
def list_allocations(
    budget_plan_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[AllocationOut]:
    rows = db.scalars(
        select(BudgetAllocation).where(BudgetAllocation.budget_plan_id == budget_plan_id).order_by(BudgetAllocation.id)
    ).all()
    return [
        AllocationOut(
            id=r.id,
            budget_plan_id=r.budget_plan_id,
            budget_line_id=r.budget_line_id,
            org_unit=r.org_unit,
            amount_xof=r.amount_xof,
            period=r.period,
        )
        for r in rows
    ]

