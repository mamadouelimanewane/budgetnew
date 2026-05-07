"""
Router Géo-Tableau de Bord & Multi-Entités — BudgetNew Premium
Dépenses par région sénégalaise + consolidation multi-entités.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import User, Payment, Commitment, BudgetAllocation
from app.models_premium import GeoExpenditure, Entity
from app.rbac import require_role

router = APIRouter(tags=["premium:geo"])

# ─── Régions officielles du Sénégal ──────────────────────────────────────────
SENEGAL_REGIONS = [
    "Dakar", "Thiès", "Diourbel", "Fatick", "Kaolack", "Kaffrine",
    "Louga", "Saint-Louis", "Matam", "Tambacounda", "Kédougou",
    "Kolda", "Ziguinchor", "Sédhiou",
]

# Coordonnées approximatives (lat, lng) pour cartographie
REGION_COORDS = {
    "Dakar": (14.7167, -17.4677),
    "Thiès": (14.7912, -16.9256),
    "Diourbel": (14.6544, -16.2314),
    "Fatick": (14.3392, -16.4112),
    "Kaolack": (14.1517, -16.0726),
    "Kaffrine": (14.1049, -15.5499),
    "Louga": (15.6180, -16.2247),
    "Saint-Louis": (16.0179, -16.4896),
    "Matam": (15.6562, -13.2557),
    "Tambacounda": (13.7707, -13.6673),
    "Kédougou": (12.5601, -12.1747),
    "Kolda": (12.8981, -14.9408),
    "Ziguinchor": (12.5681, -16.2719),
    "Sédhiou": (12.7080, -15.5569),
}


# ─── Schemas ─────────────────────────────────────────────────────────────────

class GeoExpIn(BaseModel):
    region: str = Field(min_length=1, max_length=80)
    fiscal_year: int = Field(ge=2000, le=2100)
    budget_plan_id: int
    amount_xof: int = Field(ge=0)
    category: str = Field(default="", max_length=80)

class GeoExpOut(GeoExpIn):
    id: int
    lat: float | None
    lng: float | None

class RegionSummary(BaseModel):
    region: str
    lat: float | None
    lng: float | None
    total_xof: int
    count: int
    pct_of_total: float

class EntityIn(BaseModel):
    code: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=2, max_length=200)
    entity_type: str = Field(default="direction")
    parent_id: int | None = None
    region: str = Field(default="Dakar", max_length=80)

class EntityOut(EntityIn):
    id: int
    is_active: bool


# ─── Géo endpoints ───────────────────────────────────────────────────────────

@router.get("/geo/regions")
def list_regions() -> dict:
    """Retourne les 14 régions officielles du Sénégal avec coordonnées."""
    return {
        "regions": [
            {"name": r, "lat": REGION_COORDS[r][0], "lng": REGION_COORDS[r][1]}
            for r in SENEGAL_REGIONS
        ]
    }


@router.post("/geo/expenditures", response_model=GeoExpOut)
def record_geo_expenditure(
    payload: GeoExpIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "ordonnateur")),
) -> GeoExpOut:
    if payload.region not in SENEGAL_REGIONS:
        raise HTTPException(400, f"Région invalide. Valeurs acceptées : {SENEGAL_REGIONS}")
    g = GeoExpenditure(**payload.model_dump())
    db.add(g)
    db.commit()
    db.refresh(g)
    coords = REGION_COORDS.get(g.region)
    return GeoExpOut(**payload.model_dump(), id=g.id,
                     lat=coords[0] if coords else None, lng=coords[1] if coords else None)


@router.get("/geo/expenditures/summary", response_model=list[RegionSummary])
def geo_summary(
    fiscal_year: int | None = None,
    budget_plan_id: int | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "ordonnateur", "viewer")),
) -> list[RegionSummary]:
    stmt = select(
        GeoExpenditure.region,
        func.sum(GeoExpenditure.amount_xof).label("total_xof"),
        func.count(GeoExpenditure.id).label("cnt"),
    ).group_by(GeoExpenditure.region)

    if fiscal_year:
        stmt = stmt.where(GeoExpenditure.fiscal_year == fiscal_year)
    if budget_plan_id:
        stmt = stmt.where(GeoExpenditure.budget_plan_id == budget_plan_id)

    rows = db.execute(stmt).all()
    grand_total = sum(r.total_xof for r in rows) or 1

    results = []
    for r in rows:
        coords = REGION_COORDS.get(r.region)
        results.append(RegionSummary(
            region=r.region,
            lat=coords[0] if coords else None,
            lng=coords[1] if coords else None,
            total_xof=r.total_xof,
            count=r.cnt,
            pct_of_total=round(r.total_xof / grand_total * 100, 2),
        ))

    # Ajouter régions sans données avec 0
    existing = {r.region for r in rows}
    for reg in SENEGAL_REGIONS:
        if reg not in existing:
            coords = REGION_COORDS.get(reg)
            results.append(RegionSummary(
                region=reg, lat=coords[0] if coords else None,
                lng=coords[1] if coords else None,
                total_xof=0, count=0, pct_of_total=0.0,
            ))

    return sorted(results, key=lambda x: -x.total_xof)


# ─── Multi-entités ───────────────────────────────────────────────────────────

@router.post("/entities", response_model=EntityOut)
def create_entity(
    payload: EntityIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin")),
) -> EntityOut:
    existing = db.scalar(select(Entity).where(Entity.code == payload.code))
    if existing:
        raise HTTPException(400, f"Code entité '{payload.code}' déjà utilisé")
    e = Entity(**payload.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return EntityOut(**payload.model_dump(), id=e.id, is_active=e.is_active)


@router.get("/entities", response_model=list[EntityOut])
def list_entities(
    entity_type: str | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "ordonnateur", "viewer")),
) -> list[EntityOut]:
    stmt = select(Entity).where(Entity.is_active == True).order_by(Entity.name)
    if entity_type:
        stmt = stmt.where(Entity.entity_type == entity_type)
    rows = db.scalars(stmt).all()
    return [EntityOut(id=r.id, code=r.code, name=r.name, entity_type=r.entity_type,
                      parent_id=r.parent_id, region=r.region, is_active=r.is_active) for r in rows]


@router.get("/entities/{entity_id}/consolidation")
def entity_consolidation(
    entity_id: int,
    fiscal_year: int | None = None,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst")),
) -> dict:
    """Consolidation budgétaire pour une entité et ses sous-entités."""
    entity = db.get(Entity, entity_id)
    if not entity:
        raise HTTPException(404, "Entité introuvable")

    # Trouver toutes les sous-entités (1 niveau)
    children = db.scalars(
        select(Entity).where(Entity.parent_id == entity_id, Entity.is_active == True)
    ).all()

    all_ids = [entity_id] + [c.id for c in children]
    all_units = [entity.code] + [c.code for c in children]

    # Agrégation allocations
    total_allocated = 0
    total_paid = 0
    by_unit = []

    for code in all_units:
        alloc = db.scalar(
            select(func.sum(BudgetAllocation.amount_xof))
            .where(BudgetAllocation.org_unit == code)
        ) or 0
        if fiscal_year:
            paid_q = db.scalar(
                select(func.sum(Payment.amount_xof))
                .join(Commitment, Payment.commitment_id == Commitment.id)
                .where(Commitment.org_unit == code, Commitment.fiscal_year == fiscal_year)
            ) or 0
        else:
            paid_q = db.scalar(
                select(func.sum(Payment.amount_xof))
                .join(Commitment, Payment.commitment_id == Commitment.id)
                .where(Commitment.org_unit == code)
            ) or 0

        total_allocated += alloc
        total_paid += paid_q
        by_unit.append({
            "code": code,
            "allocated_xof": alloc,
            "paid_xof": paid_q,
            "available_xof": max(0, alloc - paid_q),
            "consumption_rate": round((paid_q / alloc * 100) if alloc else 0, 2),
        })

    return {
        "entity": {"id": entity.id, "code": entity.code, "name": entity.name},
        "children_count": len(children),
        "fiscal_year": fiscal_year,
        "consolidated": {
            "total_allocated_xof": total_allocated,
            "total_paid_xof": total_paid,
            "total_available_xof": max(0, total_allocated - total_paid),
            "overall_consumption_rate": round((total_paid / total_allocated * 100) if total_allocated else 0, 2),
        },
        "by_unit": by_unit,
    }
