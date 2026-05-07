"""
Router Licence & Plan SaaS — BudgetNew
Gestion Standard vs Premium + feature flags.
"""
from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import User
from app.models_premium import License
from app.rbac import require_role

router = APIRouter(tags=["license"])

# ─── Features par plan ────────────────────────────────────────────────────────
PLAN_FEATURES = {
    "standard": [
        "budget_plans",
        "budget_allocations",
        "commitments",
        "payments",
        "vendors",
        "audit_trail",
        "rbac_4_roles",
        "export_xlsx",
        "export_pdf",
        "i18n_fr_wo_en",
        "ai_forecast_basic",
        "delegation",
        "api_rest",
    ],
    "premium": [
        # Tout ce que standard a +
        "budget_plans",
        "budget_allocations",
        "commitments",
        "payments",
        "vendors",
        "audit_trail",
        "rbac_4_roles",
        "export_xlsx",
        "export_pdf",
        "i18n_fr_wo_en",
        "ai_forecast_basic",
        "delegation",
        "api_rest",
        # Premium exclusif
        "dcmp_marches_publics",
        "simulation_whatif",
        "smart_alerts",
        "collaboration_comments",
        "geo_dashboard_senegal",
        "multi_entity_consolidation",
        "ai_anomaly_advanced",
        "ai_chatbot_nl",
        "tofe_export_bceao",
        "webhooks",
        "rate_limiting_advanced",
        "sla_support",
    ]
}

PLAN_LIMITS = {
    "standard": {
        "max_users": 10,
        "max_budget_plans": 3,
        "max_commitments_per_month": 200,
        "support": "email",
        "price_fcfa_month": 150_000,
    },
    "premium": {
        "max_users": -1,  # illimité
        "max_budget_plans": -1,
        "max_commitments_per_month": -1,
        "support": "24/7 téléphone + email",
        "price_fcfa_month": 500_000,
    }
}


class LicenseOut(BaseModel):
    plan: str
    org_name: str
    max_users: int
    expires_at: datetime | None
    features: list[str]
    limits: dict
    is_active: bool
    days_remaining: int | None


class PlanComparisonOut(BaseModel):
    standard: dict
    premium: dict


@router.get("/license/current", response_model=LicenseOut)
def get_current_license(
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "ordonnateur", "comptable", "viewer")),
) -> LicenseOut:
    lic = db.scalar(select(License).where(License.is_active == True).order_by(License.id.desc()))
    if not lic:
        # Licence standard par défaut
        return LicenseOut(
            plan="standard",
            org_name="Organisation",
            max_users=10,
            expires_at=None,
            features=PLAN_FEATURES["standard"],
            limits=PLAN_LIMITS["standard"],
            is_active=True,
            days_remaining=None,
        )

    days = None
    if lic.expires_at:
        delta = lic.expires_at - datetime.utcnow()
        days = max(0, delta.days)

    return LicenseOut(
        plan=lic.plan,
        org_name=lic.org_name,
        max_users=lic.max_users,
        expires_at=lic.expires_at,
        features=PLAN_FEATURES.get(lic.plan, PLAN_FEATURES["standard"]),
        limits=PLAN_LIMITS.get(lic.plan, PLAN_LIMITS["standard"]),
        is_active=lic.is_active,
        days_remaining=days,
    )


@router.get("/license/plans", response_model=PlanComparisonOut)
def compare_plans() -> PlanComparisonOut:
    """Comparaison publique des plans Standard vs Premium."""
    return PlanComparisonOut(
        standard={
            "name": "Budget1 Standard",
            "price_fcfa_month": 150_000,
            "price_label": "150 000 FCFA / mois",
            "target": "Petites entités publiques, services déconcentrés",
            "features": PLAN_FEATURES["standard"],
            "limits": PLAN_LIMITS["standard"],
        },
        premium={
            "name": "BudgetNew Premium",
            "price_fcfa_month": 500_000,
            "price_label": "500 000 FCFA / mois",
            "target": "Ministères, directions générales, agences UEMOA",
            "features": PLAN_FEATURES["premium"],
            "limits": PLAN_LIMITS["premium"],
            "premium_only": [f for f in PLAN_FEATURES["premium"] if f not in PLAN_FEATURES["standard"]],
        }
    )


@router.post("/license/activate")
def activate_license(
    plan: str,
    org_name: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin")),
) -> dict:
    if plan not in ("standard", "premium"):
        raise HTTPException(400, "Plan invalide. Valeurs: standard, premium")

    # Désactiver l'ancienne licence
    old = db.scalar(select(License).where(License.is_active == True))
    if old:
        old.is_active = False

    lic = License(
        plan=plan,
        org_name=org_name,
        max_users=PLAN_LIMITS[plan]["max_users"],
        features_json=json.dumps(PLAN_FEATURES[plan]),
        is_active=True,
    )
    db.add(lic)
    db.commit()
    return {"ok": True, "plan": plan, "features_count": len(PLAN_FEATURES[plan])}


def require_premium(db: Session, feature: str) -> None:
    """Helper: lève une 402 si le feature premium n'est pas activé."""
    lic = db.scalar(select(License).where(License.is_active == True))
    plan = lic.plan if lic else "standard"
    if feature not in PLAN_FEATURES.get(plan, []):
        raise HTTPException(
            status_code=402,
            detail=f"La fonctionnalité '{feature}' requiert le plan Premium. "
                   "Contactez votre administrateur pour mettre à niveau."
        )
