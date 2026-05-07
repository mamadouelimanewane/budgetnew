from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import BudgetAllocation, Commitment, Payment, User
from app.routers.auth import get_current_user
from app.routers.revenue import Revenue


router = APIRouter(tags=["kpi"])


class ExecutionTotals(BaseModel):
    allocated_xof: int
    paid_xof: int
    available_xof: int
    consumption_rate: float
    revenue_xof: int


class ExecutionByOrgRow(BaseModel):
    org_unit: str
    allocated_xof: int
    paid_xof: int
    available_xof: int
    consumption_rate: float
    revenue_xof: int


class ExecutionOut(BaseModel):
    budget_plan_id: int
    fiscal_year: int | None
    totals: ExecutionTotals
    by_org: list[ExecutionByOrgRow]


@router.get("/execution", response_model=ExecutionOut)
def execution(
    budget_plan_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
) -> ExecutionOut:
    allocs = db.scalars(select(BudgetAllocation).where(BudgetAllocation.budget_plan_id == budget_plan_id)).all()
    if not allocs:
        raise HTTPException(status_code=404, detail="No allocations for this budget_plan_id")

    allocated_total = sum(int(a.amount_xof) for a in allocs)
    allocated_by_org: dict[str, int] = {}
    for a in allocs:
        allocated_by_org[a.org_unit] = allocated_by_org.get(a.org_unit, 0) + int(a.amount_xof)

    commits = db.scalars(select(Commitment).where(Commitment.budget_plan_id == budget_plan_id)).all()
    fiscal_year = commits[0].fiscal_year if commits else None
    commit_by_id = {c.id: c for c in commits}
    commit_ids = list(commit_by_id.keys())

    paid_by_org: dict[str, int] = {}
    paid_total = 0
    if commit_ids:
        pays = db.scalars(select(Payment).where(Payment.commitment_id.in_(commit_ids))).all()
        for p in pays:
            c = commit_by_id.get(p.commitment_id)
            if not c:
                continue
            paid_total += int(p.amount_xof)
            paid_by_org[c.org_unit] = paid_by_org.get(c.org_unit, 0) + int(p.amount_xof)

    revenue_by_org: dict[str, int] = {}
    revenue_total = 0
    if fiscal_year is not None:
        revs = db.scalars(select(Revenue).where(Revenue.fiscal_year == fiscal_year)).all()
        for r in revs:
            revenue_total += int(r.amount_xof)
            revenue_by_org[r.org_unit] = revenue_by_org.get(r.org_unit, 0) + int(r.amount_xof)

    all_orgs = sorted(set(allocated_by_org) | set(paid_by_org) | set(revenue_by_org))
    by_org = []
    for org in all_orgs:
        alloc = int(allocated_by_org.get(org, 0))
        paid = int(paid_by_org.get(org, 0))
        avail = alloc - paid
        rate = (paid / alloc) if alloc else 0.0
        by_org.append(
            ExecutionByOrgRow(
                org_unit=org,
                allocated_xof=alloc,
                paid_xof=paid,
                available_xof=avail,
                consumption_rate=float(rate),
                revenue_xof=int(revenue_by_org.get(org, 0)),
            )
        )

    totals = ExecutionTotals(
        allocated_xof=int(allocated_total),
        paid_xof=int(paid_total),
        available_xof=int(allocated_total - paid_total),
        consumption_rate=float((paid_total / allocated_total) if allocated_total else 0.0),
        revenue_xof=int(revenue_total),
    )

    return ExecutionOut(budget_plan_id=budget_plan_id, fiscal_year=fiscal_year, totals=totals, by_org=by_org)

