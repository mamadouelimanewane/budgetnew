from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.audit import append_audit_event
from app.deps import get_db
from app.models import Delegation, Role, User, UserRole
from app.routers.auth import get_current_user


router = APIRouter(tags=["admin"])


def _require_admin(user: User) -> None:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")


class RoleIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=255)


class RoleOut(RoleIn):
    id: int


@router.post("/roles", response_model=RoleOut)
def create_role(payload: RoleIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> RoleOut:
    _require_admin(user)
    existing = db.scalar(select(Role).where(Role.name == payload.name))
    if existing:
        raise HTTPException(status_code=400, detail="Role exists")
    r = Role(name=payload.name, description=payload.description)
    db.add(r)
    db.commit()
    db.refresh(r)
    append_audit_event(db=db, actor_user_id=user.id, action="create", entity="Role", entity_id=str(r.id), details=payload.model_dump())
    return RoleOut(id=r.id, **payload.model_dump())


@router.get("/roles", response_model=list[RoleOut])
def list_roles(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[RoleOut]:
    _require_admin(user)
    rows = db.scalars(select(Role).order_by(Role.name)).all()
    return [RoleOut(id=r.id, name=r.name, description=r.description) for r in rows]


class AssignRoleIn(BaseModel):
    user_id: int
    role_name: str


@router.post("/roles/assign")
def assign_role(payload: AssignRoleIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    _require_admin(user)
    u = db.get(User, payload.user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    r = db.scalar(select(Role).where(Role.name == payload.role_name))
    if not r:
        raise HTTPException(status_code=404, detail="Role not found")
    existing = db.scalar(select(UserRole).where(UserRole.user_id == u.id).where(UserRole.role_id == r.id))
    if existing:
        return {"ok": True}
    ur = UserRole(user_id=u.id, role_id=r.id)
    db.add(ur)
    db.commit()
    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="assign",
        entity="UserRole",
        entity_id=str(ur.id),
        details={"user_id": u.id, "role": r.name},
    )
    return {"ok": True}


class DelegationIn(BaseModel):
    user_from_id: int
    user_to_id: int
    limit_xof: int = Field(ge=0)
    starts_at: str  # ISO
    ends_at: str  # ISO


class DelegationOut(BaseModel):
    id: int
    user_from_id: int
    user_to_id: int
    limit_xof: int
    starts_at: str
    ends_at: str
    is_active: bool


@router.post("/delegations", response_model=DelegationOut)
def create_delegation(payload: DelegationIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> DelegationOut:
    _require_admin(user)
    if not db.get(User, payload.user_from_id) or not db.get(User, payload.user_to_id):
        raise HTTPException(status_code=404, detail="User not found")
    try:
        s = datetime.fromisoformat(payload.starts_at)
        e = datetime.fromisoformat(payload.ends_at)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid dates")
    if s.tzinfo is None:
        s = s.replace(tzinfo=timezone.utc)
    if e.tzinfo is None:
        e = e.replace(tzinfo=timezone.utc)
    d = Delegation(
        user_from_id=payload.user_from_id,
        user_to_id=payload.user_to_id,
        limit_xof=payload.limit_xof,
        starts_at=s,
        ends_at=e,
        is_active=True,
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    append_audit_event(
        db=db,
        actor_user_id=user.id,
        action="create",
        entity="Delegation",
        entity_id=str(d.id),
        details=payload.model_dump(),
    )
    return DelegationOut(
        id=d.id,
        user_from_id=d.user_from_id,
        user_to_id=d.user_to_id,
        limit_xof=d.limit_xof,
        starts_at=d.starts_at.isoformat(),
        ends_at=d.ends_at.isoformat(),
        is_active=d.is_active,
    )

