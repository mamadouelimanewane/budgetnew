"""
Router Marchés Publics DCMP — BudgetNew Premium
Gestion des appels d'offres avec seuils officiels sénégalais.
"""
from __future__ import annotations

import re
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, validator
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.deps import get_db
from app.models import User
from app.models_premium import PublicTender, TenderBid
from app.rbac import require_role

router = APIRouter(tags=["premium:dcmp"])

# ─── Seuils DCMP Sénégal (FCFA) ──────────────────────────────────────────────
SEUILS_DCMP = {
    "entente_directe":          5_000_000,      # < 5 M FCFA
    "demande_renseignement":   50_000_000,      # 5 M – 50 M FCFA
    "appel_offres_ouvert":  9_999_999_999,      # > 50 M FCFA
}

def compute_procedure(amount_xof: int) -> str:
    if amount_xof < 5_000_000:
        return "entente_directe"
    elif amount_xof < 50_000_000:
        return "demande_renseignement"
    else:
        return "appel_offres_ouvert"

def procedure_label(p: str) -> str:
    labels = {
        "entente_directe": "Entente directe (< 5 M FCFA)",
        "demande_renseignement": "Demande de renseignement (5–50 M FCFA)",
        "appel_offres_ouvert": "Appel d'offres ouvert (> 50 M FCFA)",
        "appel_offres_restreint": "Appel d'offres restreint",
    }
    return labels.get(p, p)


# ─── Schemas ─────────────────────────────────────────────────────────────────

class TenderIn(BaseModel):
    title: str = Field(min_length=3, max_length=300)
    org_unit: str = Field(min_length=1, max_length=120)
    fiscal_year: int = Field(ge=2000, le=2100)
    budget_line_id: int
    estimated_amount_xof: int = Field(ge=0)
    dcmp_reference: str = Field(default="", max_length=80)
    publication_date: datetime | None = None
    deadline_date: datetime | None = None
    notes: str = Field(default="", max_length=2000)

class TenderOut(TenderIn):
    id: int
    reference: str
    procedure_type: str
    procedure_label: str
    status: str
    created_at: datetime

class TenderStatusIn(BaseModel):
    status: str = Field(pattern="^(draft|published|evaluation|awarded|cancelled)$")
    awarded_vendor_id: int | None = None
    awarded_amount_xof: int | None = None

class BidIn(BaseModel):
    vendor_id: int
    amount_xof: int = Field(ge=0)
    technical_score: float | None = Field(default=None, ge=0, le=100)
    financial_score: float | None = Field(default=None, ge=0, le=100)
    notes: str = Field(default="", max_length=1000)

class BidOut(BidIn):
    id: int
    tender_id: int
    status: str
    created_at: datetime

class SeuiilsOut(BaseModel):
    entente_directe_max_xof: int
    demande_renseignement_max_xof: int
    appel_offres_min_xof: int
    description: str


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/dcmp/seuils", response_model=SeuiilsOut)
def get_seuils() -> SeuiilsOut:
    """Retourne les seuils officiels DCMP du Sénégal."""
    return SeuiilsOut(
        entente_directe_max_xof=4_999_999,
        demande_renseignement_max_xof=49_999_999,
        appel_offres_min_xof=50_000_000,
        description="Seuils DCMP Sénégal en vigueur — Décret n°2007-545 et modifications"
    )


@router.post("/dcmp/tenders", response_model=TenderOut)
def create_tender(
    payload: TenderIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur")),
) -> TenderOut:
    # Auto-calcul procédure
    proc = compute_procedure(payload.estimated_amount_xof)
    # Génération référence automatique
    count = db.scalar(select(func.count()).select_from(PublicTender)) or 0
    ref = f"AO-{payload.fiscal_year}-{str(count + 1).zfill(4)}"

    t = PublicTender(
        reference=ref,
        title=payload.title,
        org_unit=payload.org_unit,
        fiscal_year=payload.fiscal_year,
        budget_line_id=payload.budget_line_id,
        estimated_amount_xof=payload.estimated_amount_xof,
        procedure_type=proc,
        dcmp_reference=payload.dcmp_reference,
        publication_date=payload.publication_date,
        deadline_date=payload.deadline_date,
        notes=payload.notes,
        created_by_user_id=user.id,
    )
    db.add(t)
    db.commit()
    db.refresh(t)

    append_audit_event(db=db, actor_user_id=user.id, action="create",
                       entity="PublicTender", entity_id=str(t.id),
                       details={"reference": ref, "amount": payload.estimated_amount_xof, "procedure": proc})

    return _tender_out(t)


@router.get("/dcmp/tenders", response_model=list[TenderOut])
def list_tenders(
    fiscal_year: int | None = None,
    status: str | None = None,
    procedure_type: str | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "ordonnateur", "analyst", "viewer")),
) -> list[TenderOut]:
    stmt = select(PublicTender).order_by(PublicTender.id.desc()).limit(500)
    if fiscal_year:
        stmt = stmt.where(PublicTender.fiscal_year == fiscal_year)
    if status:
        stmt = stmt.where(PublicTender.status == status)
    if procedure_type:
        stmt = stmt.where(PublicTender.procedure_type == procedure_type)
    return [_tender_out(t) for t in db.scalars(stmt).all()]


@router.get("/dcmp/tenders/{tender_id}", response_model=TenderOut)
def get_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "ordonnateur", "analyst", "viewer")),
) -> TenderOut:
    t = db.get(PublicTender, tender_id)
    if not t:
        raise HTTPException(404, "Appel d'offres introuvable")
    return _tender_out(t)


@router.patch("/dcmp/tenders/{tender_id}/status")
def update_tender_status(
    tender_id: int,
    payload: TenderStatusIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur")),
) -> dict:
    t = db.get(PublicTender, tender_id)
    if not t:
        raise HTTPException(404, "Appel d'offres introuvable")
    old = t.status
    t.status = payload.status
    if payload.awarded_vendor_id:
        t.awarded_vendor_id = payload.awarded_vendor_id
    if payload.awarded_amount_xof:
        t.awarded_amount_xof = payload.awarded_amount_xof
    db.commit()
    append_audit_event(db=db, actor_user_id=user.id, action="update_status",
                       entity="PublicTender", entity_id=str(tender_id),
                       details={"old_status": old, "new_status": payload.status})
    return {"ok": True, "status": payload.status}


@router.post("/dcmp/tenders/{tender_id}/bids", response_model=BidOut)
def add_bid(
    tender_id: int,
    payload: BidIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur", "analyst")),
) -> BidOut:
    t = db.get(PublicTender, tender_id)
    if not t:
        raise HTTPException(404, "Appel d'offres introuvable")
    b = TenderBid(tender_id=tender_id, **payload.model_dump())
    db.add(b)
    db.commit()
    db.refresh(b)
    return BidOut(id=b.id, tender_id=b.tender_id, status=b.status,
                  created_at=b.created_at, **payload.model_dump())


@router.get("/dcmp/tenders/{tender_id}/bids", response_model=list[BidOut])
def list_bids(
    tender_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "ordonnateur", "analyst", "viewer")),
) -> list[BidOut]:
    rows = db.scalars(select(TenderBid).where(TenderBid.tender_id == tender_id)).all()
    return [BidOut(id=b.id, tender_id=b.tender_id, vendor_id=b.vendor_id,
                   amount_xof=b.amount_xof, technical_score=b.technical_score,
                   financial_score=b.financial_score, notes=b.notes,
                   status=b.status, created_at=b.created_at) for b in rows]


@router.get("/dcmp/stats")
def dcmp_stats(
    fiscal_year: int | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "ordonnateur", "analyst", "viewer")),
) -> dict:
    stmt = select(PublicTender)
    if fiscal_year:
        stmt = stmt.where(PublicTender.fiscal_year == fiscal_year)
    tenders = db.scalars(stmt).all()

    by_proc: dict[str, dict] = {}
    for t in tenders:
        p = t.procedure_type
        if p not in by_proc:
            by_proc[p] = {"count": 0, "total_xof": 0, "label": procedure_label(p)}
        by_proc[p]["count"] += 1
        by_proc[p]["total_xof"] += t.estimated_amount_xof or 0

    by_status: dict[str, int] = {}
    for t in tenders:
        by_status[t.status] = by_status.get(t.status, 0) + 1

    return {
        "total": len(tenders),
        "total_estimated_xof": sum(t.estimated_amount_xof or 0 for t in tenders),
        "by_procedure": by_proc,
        "by_status": by_status,
    }


def _tender_out(t: PublicTender) -> TenderOut:
    return TenderOut(
        id=t.id, reference=t.reference, title=t.title, org_unit=t.org_unit,
        fiscal_year=t.fiscal_year, budget_line_id=t.budget_line_id,
        estimated_amount_xof=t.estimated_amount_xof,
        procedure_type=t.procedure_type, procedure_label=procedure_label(t.procedure_type),
        status=t.status, dcmp_reference=t.dcmp_reference or "",
        publication_date=t.publication_date, deadline_date=t.deadline_date,
        notes=t.notes or "", created_at=t.created_at,
    )
