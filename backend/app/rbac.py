from __future__ import annotations

from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import Delegation, Role, User, UserRole
from app.routers.auth import get_current_user


def get_user_roles(db: Session, user_id: int) -> set[str]:
    rows = db.execute(
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
    ).all()
    return {r[0] for r in rows}


def require_role(*role_names: str):
    def _dep(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> User:
        if user.is_admin:
            return user
        roles = get_user_roles(db, user.id)
        if any(r in roles for r in role_names):
            return user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    return _dep


def can_approve_amount(db: Session, *, approver_id: int, amount_xof: int) -> bool:
    """
    Baseline: un admin peut valider tout.
    Sinon: rôle 'validator' requis, et délégation active (optionnelle) doit couvrir le montant si définie.
    """
    u = db.get(User, approver_id)
    if not u or not u.is_active:
        return False
    if u.is_admin:
        return True
    roles = get_user_roles(db, approver_id)
    if "validator" not in roles:
        return False

    # Si pas de délégation trouvée, on autorise en baseline (politique à durcir selon organisation).
    now = datetime.now(timezone.utc)
    d = db.scalar(
        select(Delegation)
        .where(Delegation.user_to_id == approver_id)
        .where(Delegation.is_active == True)  # noqa: E712
        .where(Delegation.starts_at <= now)
        .where(Delegation.ends_at >= now)
        .order_by(Delegation.id.desc())
        .limit(1)
    )
    if not d:
        return True
    return amount_xof <= d.limit_xof

