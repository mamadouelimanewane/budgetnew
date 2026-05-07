"""
Router Commentaires & Collaboration — BudgetNew Premium
Annotations contextuelles sur les entités budgétaires.
"""
from __future__ import annotations

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import User
from app.models_premium import Comment
from app.rbac import require_role

router = APIRouter(tags=["premium:collaboration"])


class CommentIn(BaseModel):
    entity: str = Field(min_length=1, max_length=80)
    entity_id: str = Field(min_length=1, max_length=80)
    body: str = Field(min_length=1, max_length=4000)
    mentions: list[int] = Field(default=[])
    parent_id: int | None = None


class CommentOut(BaseModel):
    id: int
    entity: str
    entity_id: str
    body: str
    mentions: list[int]
    parent_id: int | None
    author_user_id: int
    created_at: datetime
    updated_at: datetime | None


class CommentUpdateIn(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


@router.post("/comments", response_model=CommentOut)
def create_comment(
    payload: CommentIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "analyst", "ordonnateur", "comptable", "viewer")),
) -> CommentOut:
    c = Comment(
        entity=payload.entity,
        entity_id=payload.entity_id,
        body=payload.body,
        mentions_json=json.dumps(payload.mentions),
        parent_id=payload.parent_id,
        author_user_id=user.id,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _comment_out(c)


@router.get("/comments", response_model=list[CommentOut])
def list_comments(
    entity: str,
    entity_id: str,
    db: Session = Depends(get_db),
    _user: User = Depends(require_role("admin", "analyst", "ordonnateur", "comptable", "viewer")),
) -> list[CommentOut]:
    rows = db.scalars(
        select(Comment)
        .where(Comment.entity == entity, Comment.entity_id == entity_id, Comment.is_deleted == False)
        .order_by(Comment.created_at.asc())
    ).all()
    return [_comment_out(c) for c in rows]


@router.patch("/comments/{comment_id}", response_model=CommentOut)
def update_comment(
    comment_id: int,
    payload: CommentUpdateIn,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "analyst", "ordonnateur", "comptable", "viewer")),
) -> CommentOut:
    c = db.get(Comment, comment_id)
    if not c or c.is_deleted:
        raise HTTPException(404, "Commentaire introuvable")
    if c.author_user_id != user.id and not user.is_admin:
        raise HTTPException(403, "Vous ne pouvez modifier que vos propres commentaires")
    c.body = payload.body
    c.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(c)
    return _comment_out(c)


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "analyst", "ordonnateur", "comptable", "viewer")),
) -> dict:
    c = db.get(Comment, comment_id)
    if not c:
        raise HTTPException(404, "Commentaire introuvable")
    if c.author_user_id != user.id and not user.is_admin:
        raise HTTPException(403, "Action non autorisée")
    c.is_deleted = True
    db.commit()
    return {"ok": True}


def _comment_out(c: Comment) -> CommentOut:
    return CommentOut(
        id=c.id, entity=c.entity, entity_id=c.entity_id, body=c.body,
        mentions=json.loads(c.mentions_json or "[]"),
        parent_id=c.parent_id, author_user_id=c.author_user_id,
        created_at=c.created_at, updated_at=c.updated_at,
    )
