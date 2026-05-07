"""
Router Alertes Intelligentes — BudgetNew Premium
Règles configurables, déclenchement automatique, multi-canaux (email/SMS/WhatsApp).
"""
from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.deps import get_db
from app.models import User, BudgetAllocation, Payment, Commitment
from app.models_premium import AlertRule, AlertEvent
from app.rbac import require_role

router = APIRouter(tags=["premium:alerts"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class AlertRuleIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    rule_type: str = Field(pattern="^(budget_threshold|commitment_spike|anomaly_detected|deadline_approaching|consumption_rate)$")
    org_unit: str = Field(default="*", max_length=120)
    threshold_pct: float | None = Field(default=None, ge=0, le=100)
    threshold_xof: int | None = None
    channels: list[str] = Field(default=["email"])
    recipients: list[str] = Field(default=[])
    is_active: bool = True

class AlertRuleOut(AlertRuleIn):
    id: int
    created_at: datetime

class AlertEventOut(BaseModel):
    id: int
    rule_id: int
    severity: str
    title: str
    body: str
    entity: str
    entity_id: str
    acknowledged: bool
    acknowledged_at: datetime | None
    created_at: datetime

class AcknowledgeIn(BaseModel):
    user_id: int


# ─── CRUD Règles ─────────────────────────────────────────────────────────────

@router.post("/alerts/rules", response_model=AlertRuleOut)
def create_rule(
    payload: AlertRuleIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur")),
) -> AlertRuleOut:
    rule = AlertRule(
        name=payload.name,
        rule_type=payload.rule_type,
        org_unit=payload.org_unit,
        threshold_pct=payload.threshold_pct,
        threshold_xof=payload.threshold_xof,
        channels_json=json.dumps(payload.channels),
        recipients_json=json.dumps(payload.recipients),
        is_active=payload.is_active,
        created_by_user_id=user.id,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    append_audit_event(db=db, actor_user_id=user.id, action="create",
                       entity="AlertRule", entity_id=str(rule.id),
                       details={"name": payload.name, "type": payload.rule_type})
    return _rule_out(rule)


@router.get("/alerts/rules", response_model=list[AlertRuleOut])
def list_rules(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "ordonnateur", "analyst")),
) -> list[AlertRuleOut]:
    return [_rule_out(r) for r in db.scalars(select(AlertRule).order_by(AlertRule.id.desc())).all()]


@router.patch("/alerts/rules/{rule_id}/toggle")
def toggle_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur")),
) -> dict:
    rule = db.get(AlertRule, rule_id)
    if not rule:
        raise HTTPException(404, "Règle introuvable")
    rule.is_active = not rule.is_active
    db.commit()
    return {"ok": True, "is_active": rule.is_active}


@router.delete("/alerts/rules/{rule_id}")
def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin")),
) -> dict:
    rule = db.get(AlertRule, rule_id)
    if not rule:
        raise HTTPException(404, "Règle introuvable")
    db.delete(rule)
    db.commit()
    return {"ok": True}


# ─── Événements d'alerte ─────────────────────────────────────────────────────

@router.get("/alerts/events", response_model=list[AlertEventOut])
def list_alert_events(
    acknowledged: bool | None = None,
    severity: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "ordonnateur", "analyst")),
) -> list[AlertEventOut]:
    stmt = select(AlertEvent).order_by(AlertEvent.id.desc()).limit(min(limit, 200))
    if acknowledged is not None:
        if acknowledged:
            stmt = stmt.where(AlertEvent.acknowledged_by_user_id.isnot(None))
        else:
            stmt = stmt.where(AlertEvent.acknowledged_by_user_id.is_(None))
    if severity:
        stmt = stmt.where(AlertEvent.severity == severity)
    return [_event_out(e) for e in db.scalars(stmt).all()]


@router.post("/alerts/events/{event_id}/acknowledge")
def acknowledge_alert(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur", "analyst")),
) -> dict:
    ev = db.get(AlertEvent, event_id)
    if not ev:
        raise HTTPException(404, "Alerte introuvable")
    ev.acknowledged_by_user_id = user.id
    ev.acknowledged_at = datetime.utcnow()
    db.commit()
    return {"ok": True}


# ─── Déclenchement automatique des alertes ───────────────────────────────────

@router.post("/alerts/evaluate")
def evaluate_all_rules(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur")),
) -> dict:
    """
    Évalue toutes les règles actives et génère les alertes déclenchées.
    En production, appelé par un cron job toutes les heures.
    """
    rules = db.scalars(select(AlertRule).where(AlertRule.is_active == True)).all()
    triggered = 0

    for rule in rules:
        events = _evaluate_rule(rule, db)
        for ev in events:
            db.add(ev)
            triggered += 1

    db.commit()
    return {"ok": True, "rules_evaluated": len(rules), "alerts_triggered": triggered}


def _evaluate_rule(rule: AlertRule, db: Session) -> list[AlertEvent]:
    events = []

    if rule.rule_type == "budget_threshold":
        # Vérifier si une org_unit a dépassé le seuil % de consommation
        allocs = db.scalars(select(BudgetAllocation)).all()
        for alloc in allocs:
            if rule.org_unit != "*" and alloc.org_unit != rule.org_unit:
                continue
            # Calculer consommation
            paid = db.scalar(
                select(Payment.amount_xof).join(
                    Commitment, Payment.commitment_id == Commitment.id
                ).where(Commitment.org_unit == alloc.org_unit)
            ) or 0
            if alloc.amount_xof > 0:
                rate = (paid / alloc.amount_xof) * 100
                threshold = rule.threshold_pct or 80.0
                if rate >= threshold:
                    # Check if already triggered recently
                    existing = db.scalar(
                        select(AlertEvent).where(
                            AlertEvent.rule_id == rule.id,
                            AlertEvent.entity == "BudgetAllocation",
                            AlertEvent.entity_id == str(alloc.id),
                            AlertEvent.acknowledged_by_user_id.is_(None),
                        )
                    )
                    if not existing:
                        events.append(AlertEvent(
                            rule_id=rule.id,
                            severity="warning" if rate < 95 else "critical",
                            title=f"Alerte budget — {alloc.org_unit} à {rate:.1f}% de consommation",
                            body=(
                                f"L'unité {alloc.org_unit} a consommé {rate:.1f}% de son enveloppe "
                                f"({paid:,} / {alloc.amount_xof:,} FCFA). "
                                f"Seuil configuré : {threshold}%."
                            ),
                            entity="BudgetAllocation",
                            entity_id=str(alloc.id),
                            sent_channels_json=rule.channels_json,
                        ))

    elif rule.rule_type == "commitment_spike":
        # Détecter un engagement dont le montant dépasse le seuil absolu
        threshold_xof = rule.threshold_xof or 100_000_000
        recent = db.scalars(
            select(Commitment)
            .where(Commitment.amount_xof >= threshold_xof)
            .order_by(Commitment.id.desc())
            .limit(20)
        ).all()
        for c in recent:
            existing = db.scalar(
                select(AlertEvent).where(
                    AlertEvent.rule_id == rule.id,
                    AlertEvent.entity == "Commitment",
                    AlertEvent.entity_id == str(c.id),
                )
            )
            if not existing:
                events.append(AlertEvent(
                    rule_id=rule.id,
                    severity="warning",
                    title=f"Engagement élevé détecté — {c.amount_xof:,} FCFA",
                    body=f"L'engagement #{c.id} ({c.description or 'sans description'}) "
                         f"de {c.amount_xof:,} FCFA dépasse le seuil configuré de {threshold_xof:,} FCFA.",
                    entity="Commitment",
                    entity_id=str(c.id),
                    sent_channels_json=rule.channels_json,
                ))

    return events


def _rule_out(r: AlertRule) -> AlertRuleOut:
    return AlertRuleOut(
        id=r.id, name=r.name, rule_type=r.rule_type, org_unit=r.org_unit,
        threshold_pct=r.threshold_pct, threshold_xof=r.threshold_xof,
        channels=json.loads(r.channels_json or "[]"),
        recipients=json.loads(r.recipients_json or "[]"),
        is_active=r.is_active, created_at=r.created_at,
    )

def _event_out(e: AlertEvent) -> AlertEventOut:
    return AlertEventOut(
        id=e.id, rule_id=e.rule_id, severity=e.severity, title=e.title,
        body=e.body, entity=e.entity, entity_id=e.entity_id,
        acknowledged=e.acknowledged_by_user_id is not None,
        acknowledged_at=e.acknowledged_at, created_at=e.created_at,
    )
