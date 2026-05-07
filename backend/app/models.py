from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class BudgetLine(Base):
    __tablename__ = "budget_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(80), index=True)
    label: Mapped[str] = mapped_column(String(255), default="")
    level: Mapped[int] = mapped_column(Integer, default=4)  # chapter/article/paragraph/line, etc.


class BudgetPlan(Base):
    __tablename__ = "budget_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fiscal_year: Mapped[int] = mapped_column(Integer, index=True)
    name: Mapped[str] = mapped_column(String(200), default="Budget")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BudgetAllocation(Base):
    __tablename__ = "budget_allocations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    budget_plan_id: Mapped[int] = mapped_column(Integer, index=True)
    budget_line_id: Mapped[int] = mapped_column(Integer, index=True)
    org_unit: Mapped[str] = mapped_column(String(120), index=True)  # service/direction/site
    amount_xof: Mapped[int] = mapped_column(Integer)  # store as integer XOF cents-equivalent (XOF has no cents, still int)
    period: Mapped[str] = mapped_column(String(20), default="annual")  # monthly/quarterly/annual
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    tax_id: Mapped[str] = mapped_column(String(80), default="", index=True)
    phone: Mapped[str] = mapped_column(String(50), default="")
    email: Mapped[str] = mapped_column(String(320), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Commitment(Base):
    """
    Engagement / Bon de commande (baseline).
    """

    __tablename__ = "commitments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fiscal_year: Mapped[int] = mapped_column(Integer, index=True)
    budget_plan_id: Mapped[int] = mapped_column(Integer, index=True)
    budget_line_id: Mapped[int] = mapped_column(Integer, index=True)
    org_unit: Mapped[str] = mapped_column(String(120), index=True)
    vendor_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    description: Mapped[str] = mapped_column(String(500), default="")
    amount_xof: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="draft", index=True)  # draft/submitted/approved/ordered
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    """
    Paiement (baseline).
    """

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    commitment_id: Mapped[int] = mapped_column(Integer, index=True)
    amount_xof: Mapped[int] = mapped_column(Integer)
    method: Mapped[str] = mapped_column(String(40), default="bank")  # bank/mobile
    status: Mapped[str] = mapped_column(String(30), default="initiated", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    report_type: Mapped[str] = mapped_column(String(80), index=True)  # e.g. budget_execution
    params_json: Mapped[str] = mapped_column(String, default="{}")
    frequency: Mapped[str] = mapped_column(String(30), default="manual")  # manual/daily/weekly/monthly
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by_user_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReportRun(Base):
    __tablename__ = "report_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    schedule_id: Mapped[int] = mapped_column(Integer, index=True)
    status: Mapped[str] = mapped_column(String(30), default="completed", index=True)  # completed/failed
    output_format: Mapped[str] = mapped_column(String(10), default="xlsx")  # xlsx/pdf/csv
    file_path: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_secret: Mapped[str] = mapped_column(String(64), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    description: Mapped[str] = mapped_column(String(255), default="")


class UserRole(Base):
    __tablename__ = "user_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    role_id: Mapped[int] = mapped_column(Integer, index=True)


class Delegation(Base):
    """
    Délégation de pouvoir: user_from délègue à user_to, avec plafonds et fenêtre de validité.
    """

    __tablename__ = "delegations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_from_id: Mapped[int] = mapped_column(Integer, index=True)
    user_to_id: Mapped[int] = mapped_column(Integer, index=True)
    limit_xof: Mapped[int] = mapped_column(Integer, default=0)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    actor_user_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(80), index=True)
    entity: Mapped[str] = mapped_column(String(80), index=True)
    entity_id: Mapped[str] = mapped_column(String(80), index=True)
    ip: Mapped[str] = mapped_column(String(64), default="")
    details_json: Mapped[str] = mapped_column(String, default="{}")
    prev_hash: Mapped[str] = mapped_column(String(64), default="")
    entry_hash: Mapped[str] = mapped_column(String(64), index=True)

