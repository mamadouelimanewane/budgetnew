from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.deps import get_db
from app.models import BudgetLine, BudgetPlan, Commitment, Payment, Vendor, User
from app.rbac import can_approve_amount
from app.routers.auth import get_current_user


router = APIRouter(tags=["procurement"])


class VendorIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    tax_id: str = Field(default="", max_length=80)
    phone: str = Field(default="", max_length=50)
    email: str = Field(default="", max_length=320)


class VendorOut(VendorIn):
    id: int


class CommitmentIn(BaseModel):
    fiscal_year: int = Field(ge=1900, le=3000)
    budget_plan_id: int
    budget_line_id: int
    org_unit: str = Field(min_length=1, max_length=120)
    vendor_id: int | None = None
    description: str = Field(default="", max_length=500)
    amount_xof: int = Field(ge=0)


class CommitmentOut(CommitmentIn):
    id: int
    status: str


class PaymentIn(BaseModel):
    commitment_id: int
    amount_xof: int = Field(ge=0)
    method: str = Field(default="bank", max_length=40)


class PaymentOut(PaymentIn):
    id: int
    status: str


@router.post("/vendors", response_model=VendorOut)
def create_vendor(
    payload: VendorIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> VendorOut:
    v = Vendor(name=payload.name, tax_id=payload.tax_id, phone=payload.phone, email=payload.email)
    db.add(v)
    db.commit()
    db.refresh(v)
    append_audit_event(db=db, actor_user_id=user.id, action="create", entity="Vendor", entity_id=str(v.id), details=payload.model_dump())
    return VendorOut(id=v.id, **payload.model_dump())


@router.get("/vendors", response_model=list[VendorOut])
def list_vendors(
    q: str | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[VendorOut]:
    stmt = select(Vendor).order_by(Vendor.id.desc()).limit(500)
    if q:
        stmt = select(Vendor).where(Vendor.name.ilike(f"%{q}%")).order_by(Vendor.id.desc()).limit(500)
    rows = db.scalars(stmt).all()
    return [VendorOut(id=r.id, name=r.name, tax_id=r.tax_id, phone=r.phone, email=r.email) for r in rows]


@router.post("/commitments", response_model=CommitmentOut)
def create_commitment(
    payload: CommitmentIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CommitmentOut:
    if not db.get(BudgetPlan, payload.budget_plan_id):
        raise HTTPException(status_code=404, detail="Budget plan not found")
    if not db.get(BudgetLine, payload.budget_line_id):
        raise HTTPException(status_code=404, detail="Budget line not found")
    if payload.vendor_id is not None and not db.get(Vendor, payload.vendor_id):
        raise HTTPException(status_code=404, detail="Vendor not found")

    c = Commitment(
        fiscal_year=payload.fiscal_year,
        budget_plan_id=payload.budget_plan_id,
        budget_line_id=payload.budget_line_id,
        org_unit=payload.org_unit,
        vendor_id=payload.vendor_id,
        description=payload.description,
        amount_xof=payload.amount_xof,
        status="draft",
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="create",
        entity="Commitment",
        entity_id=str(c.id),
        details=payload.model_dump() | {"status": c.status},
    )
    return CommitmentOut(id=c.id, status=c.status, **payload.model_dump())


@router.post("/commitments/{commitment_id}/submit")
def submit_commitment(
    commitment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    c = db.get(Commitment, commitment_id)
    if not c:
        raise HTTPException(status_code=404, detail="Commitment not found")
    if c.status not in ("draft",):
        raise HTTPException(status_code=400, detail="Invalid status transition")
    c.status = "submitted"
    db.add(c)
    db.commit()
    append_audit_event(db=db, actor_user_id=user.id, action="submit", entity="Commitment", entity_id=str(c.id), details={"status": c.status})
    return {"ok": True, "status": c.status}


@router.post("/commitments/{commitment_id}/approve")
def approve_commitment(
    commitment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    c = db.get(Commitment, commitment_id)
    if not c:
        raise HTTPException(status_code=404, detail="Commitment not found")
    if c.status not in ("submitted",):
        raise HTTPException(status_code=400, detail="Invalid status transition")
    # Séparation des fonctions (baseline): l'initiateur ne peut pas valider.
    # (Dans cette v1, on approxime avec: dernier event 'create' actor != approver)
    if not can_approve_amount(db, approver_id=user.id, amount_xof=c.amount_xof):
        raise HTTPException(status_code=403, detail="Not allowed to approve")
    c.status = "approved"
    db.add(c)
    db.commit()
    append_audit_event(db=db, actor_user_id=user.id, action="approve", entity="Commitment", entity_id=str(c.id), details={"status": c.status})
    return {"ok": True, "status": c.status}


@router.get("/commitments", response_model=list[CommitmentOut])
def list_commitments(
    fiscal_year: int | None = None,
    budget_plan_id: int | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[CommitmentOut]:
    stmt = select(Commitment).order_by(Commitment.id.desc()).limit(500)
    if fiscal_year is not None:
        stmt = stmt.where(Commitment.fiscal_year == fiscal_year)
    if budget_plan_id is not None:
        stmt = stmt.where(Commitment.budget_plan_id == budget_plan_id)
    rows = db.scalars(stmt).all()
    return [
        CommitmentOut(
            id=r.id,
            fiscal_year=r.fiscal_year,
            budget_plan_id=r.budget_plan_id,
            budget_line_id=r.budget_line_id,
            org_unit=r.org_unit,
            vendor_id=r.vendor_id,
            description=r.description,
            amount_xof=r.amount_xof,
            status=r.status,
        )
        for r in rows
    ]


@router.post("/payments", response_model=PaymentOut)
def create_payment(
    payload: PaymentIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaymentOut:
    c = db.get(Commitment, payload.commitment_id)
    if not c:
        raise HTTPException(status_code=404, detail="Commitment not found")
    if payload.amount_xof > c.amount_xof:
        raise HTTPException(status_code=400, detail="Payment exceeds commitment amount")
    p = Payment(commitment_id=payload.commitment_id, amount_xof=payload.amount_xof, method=payload.method, status="initiated")
    db.add(p)
    db.commit()
    db.refresh(p)
    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="create",
        entity="Payment",
        entity_id=str(p.id),
        details=payload.model_dump() | {"status": p.status},
    )
    return PaymentOut(id=p.id, commitment_id=p.commitment_id, amount_xof=p.amount_xof, method=p.method, status=p.status)


@router.get("/payments", response_model=list[PaymentOut])
def list_payments(
    commitment_id: int | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> list[PaymentOut]:
    stmt = select(Payment).order_by(Payment.id.desc()).limit(500)
    if commitment_id is not None:
        stmt = stmt.where(Payment.commitment_id == commitment_id)
    rows = db.scalars(stmt).all()
    return [
        PaymentOut(id=r.id, commitment_id=r.commitment_id, amount_xof=r.amount_xof, method=r.method, status=r.status)
        for r in rows
    ]

