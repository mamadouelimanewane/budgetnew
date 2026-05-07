"""
BudgetNew Premium — modèles supplémentaires
Ajoutés à côté des modèles de base sans les modifier.
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Boolean, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


# ─── Module Marchés Publics DCMP ─────────────────────────────────────────────

class PublicTender(Base):
    """Appel d'offres / marché public selon seuils DCMP Sénégal."""
    __tablename__ = "public_tenders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reference: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    org_unit: Mapped[str] = mapped_column(String(120), index=True)
    fiscal_year: Mapped[int] = mapped_column(Integer, index=True)
    budget_line_id: Mapped[int] = mapped_column(Integer, index=True)
    estimated_amount_xof: Mapped[int] = mapped_column(Integer)
    # procedure: entente_directe / demande_renseignement / appel_offres_ouvert / appel_offres_restreint
    procedure_type: Mapped[str] = mapped_column(String(50), index=True)
    status: Mapped[str] = mapped_column(String(40), default="draft", index=True)
    # draft / published / evaluation / awarded / cancelled
    dcmp_reference: Mapped[str] = mapped_column(String(80), default="")
    awarded_vendor_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    awarded_amount_xof: Mapped[int | None] = mapped_column(Integer, nullable=True)
    publication_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deadline_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by_user_id: Mapped[int] = mapped_column(Integer, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    notes: Mapped[str] = mapped_column(Text, default="")


class TenderBid(Base):
    """Offre soumise par un fournisseur sur un appel d'offres."""
    __tablename__ = "tender_bids"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tender_id: Mapped[int] = mapped_column(Integer, index=True)
    vendor_id: Mapped[int] = mapped_column(Integer, index=True)
    amount_xof: Mapped[int] = mapped_column(Integer)
    technical_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    financial_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="submitted")  # submitted/evaluated/rejected/awarded
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Module Alertes Intelligentes ─────────────────────────────────────────────

class AlertRule(Base):
    """Règle d'alerte configurable (seuil, destinataires, canaux)."""
    __tablename__ = "alert_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    # rule_type: budget_threshold / commitment_spike / anomaly_detected / deadline_approaching
    rule_type: Mapped[str] = mapped_column(String(60), index=True)
    org_unit: Mapped[str] = mapped_column(String(120), default="*")  # * = all units
    threshold_pct: Mapped[float | None] = mapped_column(Float, nullable=True)  # e.g. 80.0
    threshold_xof: Mapped[int | None] = mapped_column(Integer, nullable=True)
    channels_json: Mapped[str] = mapped_column(String, default='["email"]')  # ["email","sms","whatsapp"]
    recipients_json: Mapped[str] = mapped_column(String, default="[]")  # list of emails/phones
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by_user_id: Mapped[int] = mapped_column(Integer, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AlertEvent(Base):
    """Instance d'alerte déclenchée."""
    __tablename__ = "alert_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rule_id: Mapped[int] = mapped_column(Integer, index=True)
    severity: Mapped[str] = mapped_column(String(20), default="warning")  # info/warning/critical
    title: Mapped[str] = mapped_column(String(300))
    body: Mapped[str] = mapped_column(Text, default="")
    entity: Mapped[str] = mapped_column(String(80), default="")
    entity_id: Mapped[str] = mapped_column(String(80), default="")
    sent_channels_json: Mapped[str] = mapped_column(String, default="[]")
    acknowledged_by_user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Module Simulation What-If ────────────────────────────────────────────────

class SimulationScenario(Base):
    """Scénario de simulation budgétaire (what-if)."""
    __tablename__ = "simulation_scenarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    base_budget_plan_id: Mapped[int] = mapped_column(Integer, index=True)
    # adjustments_json: list of {budget_line_id, org_unit, delta_pct, delta_xof}
    adjustments_json: Mapped[str] = mapped_column(Text, default="[]")
    # results_json: computed impact
    results_json: Mapped[str] = mapped_column(Text, default="{}")
    created_by_user_id: Mapped[int] = mapped_column(Integer, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ─── Module Multi-Entités / Consolidation ────────────────────────────────────

class Entity(Base):
    """Entité organisationnelle (Ministère, Direction, Agence)."""
    __tablename__ = "entities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    entity_type: Mapped[str] = mapped_column(String(60), default="direction")  # ministere/direction/agence/projet
    parent_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    region: Mapped[str] = mapped_column(String(80), default="Dakar")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Module Commentaires / Collaboration ─────────────────────────────────────

class Comment(Base):
    """Commentaire sur n'importe quelle entité (budget, engagement, tender...)."""
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity: Mapped[str] = mapped_column(String(80), index=True)   # BudgetPlan / Commitment / PublicTender
    entity_id: Mapped[str] = mapped_column(String(80), index=True)
    author_user_id: Mapped[int] = mapped_column(Integer, index=True)
    body: Mapped[str] = mapped_column(Text)
    mentions_json: Mapped[str] = mapped_column(String, default="[]")  # list of user_ids mentioned
    parent_id: Mapped[int | None] = mapped_column(Integer, nullable=True)  # thread support
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)


# ─── Module Géo-Tableau de Bord ───────────────────────────────────────────────

class GeoExpenditure(Base):
    """Dépenses géolocalisées par région sénégalaise."""
    __tablename__ = "geo_expenditures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    region: Mapped[str] = mapped_column(String(80), index=True)
    fiscal_year: Mapped[int] = mapped_column(Integer, index=True)
    budget_plan_id: Mapped[int] = mapped_column(Integer, index=True)
    amount_xof: Mapped[int] = mapped_column(Integer)
    category: Mapped[str] = mapped_column(String(80), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ─── Licence / Plan SaaS ──────────────────────────────────────────────────────

class License(Base):
    """Plan tarifaire : standard ou premium."""
    __tablename__ = "licenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan: Mapped[str] = mapped_column(String(30), default="standard")  # standard / premium
    org_name: Mapped[str] = mapped_column(String(200))
    max_users: Mapped[int] = mapped_column(Integer, default=10)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    features_json: Mapped[str] = mapped_column(Text, default="[]")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
