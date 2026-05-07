"""
Router Simulation What-If — BudgetNew Premium
Simulation d'impact budgétaire sans modifier les données réelles.
"""
from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.deps import get_db
from app.models import User, BudgetAllocation, Payment, Commitment
from app.models_premium import SimulationScenario
from app.rbac import require_role

router = APIRouter(tags=["premium:simulation"])


class AdjustmentItem(BaseModel):
    org_unit: str
    delta_pct: float | None = None   # e.g. -15.0 = couper de 15%
    delta_xof: int | None = None      # montant absolu delta


class SimulationIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=1000)
    base_budget_plan_id: int
    adjustments: list[AdjustmentItem]


class SimulationOut(BaseModel):
    id: int
    name: str
    description: str
    base_budget_plan_id: int
    adjustments: list[AdjustmentItem]
    results: dict
    created_at: datetime


@router.post("/simulations", response_model=SimulationOut)
def create_simulation(
    payload: SimulationIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "analyst", "ordonnateur")),
) -> SimulationOut:
    results = _compute_simulation(payload, db)

    scenario = SimulationScenario(
        name=payload.name,
        description=payload.description,
        base_budget_plan_id=payload.base_budget_plan_id,
        adjustments_json=json.dumps([a.model_dump() for a in payload.adjustments]),
        results_json=json.dumps(results),
        created_by_user_id=user.id,
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)

    append_audit_event(db=db, actor_user_id=user.id, action="create",
                       entity="Simulation", entity_id=str(scenario.id),
                       details={"name": payload.name})

    return SimulationOut(
        id=scenario.id, name=scenario.name, description=scenario.description,
        base_budget_plan_id=scenario.base_budget_plan_id,
        adjustments=payload.adjustments, results=results,
        created_at=scenario.created_at,
    )


@router.get("/simulations", response_model=list[SimulationOut])
def list_simulations(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "ordonnateur")),
) -> list[SimulationOut]:
    rows = db.scalars(select(SimulationScenario).order_by(SimulationScenario.id.desc()).limit(100)).all()
    return [_sim_out(s) for s in rows]


@router.get("/simulations/{sim_id}", response_model=SimulationOut)
def get_simulation(
    sim_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "ordonnateur")),
) -> SimulationOut:
    s = db.get(SimulationScenario, sim_id)
    if not s:
        raise HTTPException(404, "Simulation introuvable")
    return _sim_out(s)


@router.delete("/simulations/{sim_id}")
def delete_simulation(
    sim_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "analyst")),
) -> dict:
    s = db.get(SimulationScenario, sim_id)
    if not s:
        raise HTTPException(404, "Simulation introuvable")
    db.delete(s)
    db.commit()
    return {"ok": True}


@router.post("/simulations/preview", response_model=dict)
def preview_simulation(
    payload: SimulationIn,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "ordonnateur")),
) -> dict:
    """Calcule l'impact sans persister — pour aperçu temps réel."""
    return _compute_simulation(payload, db)


# ─── Moteur de simulation ─────────────────────────────────────────────────────

def _compute_simulation(payload: SimulationIn, db: Session) -> dict:
    allocs = db.scalars(
        select(BudgetAllocation)
        .where(BudgetAllocation.budget_plan_id == payload.base_budget_plan_id)
    ).all()

    adj_map: dict[str, AdjustmentItem] = {a.org_unit: a for a in payload.adjustments}

    baseline_total = sum(a.amount_xof for a in allocs)
    simulated_total = 0
    lines = []

    for alloc in allocs:
        base = alloc.amount_xof
        adj = adj_map.get(alloc.org_unit)
        if adj:
            if adj.delta_pct is not None:
                new_amount = int(base * (1 + adj.delta_pct / 100))
            elif adj.delta_xof is not None:
                new_amount = base + adj.delta_xof
            else:
                new_amount = base
        else:
            new_amount = base

        new_amount = max(0, new_amount)
        delta = new_amount - base

        # Consommation réelle
        paid = _get_paid(alloc.org_unit, db)

        simulated_total += new_amount
        lines.append({
            "org_unit": alloc.org_unit,
            "baseline_xof": base,
            "simulated_xof": new_amount,
            "delta_xof": delta,
            "delta_pct": round((delta / base * 100) if base else 0, 2),
            "paid_xof": paid,
            "simulated_available_xof": max(0, new_amount - paid),
            "simulated_consumption_rate": round((paid / new_amount * 100) if new_amount else 0, 2),
            "risk": _assess_risk(paid, new_amount),
        })

    return {
        "baseline_total_xof": baseline_total,
        "simulated_total_xof": simulated_total,
        "total_delta_xof": simulated_total - baseline_total,
        "total_delta_pct": round(((simulated_total - baseline_total) / baseline_total * 100) if baseline_total else 0, 2),
        "lines": lines,
        "summary": {
            "units_at_risk": sum(1 for l in lines if l["risk"] == "critical"),
            "units_constrained": sum(1 for l in lines if l["risk"] == "warning"),
            "units_safe": sum(1 for l in lines if l["risk"] == "ok"),
        }
    }


def _get_paid(org_unit: str, db: Session) -> int:
    result = db.scalars(
        select(Payment).join(Commitment, Payment.commitment_id == Commitment.id)
        .where(Commitment.org_unit == org_unit)
    ).all()
    return sum(p.amount_xof for p in result)


def _assess_risk(paid: int, budget: int) -> str:
    if budget == 0:
        return "critical"
    rate = paid / budget
    if rate >= 0.95:
        return "critical"
    if rate >= 0.80:
        return "warning"
    return "ok"


def _sim_out(s: SimulationScenario) -> SimulationOut:
    return SimulationOut(
        id=s.id, name=s.name, description=s.description,
        base_budget_plan_id=s.base_budget_plan_id,
        adjustments=[AdjustmentItem(**a) for a in json.loads(s.adjustments_json or "[]")],
        results=json.loads(s.results_json or "{}"),
        created_at=s.created_at,
    )
