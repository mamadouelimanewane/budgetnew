from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models import AuditEvent, User
from app.routers.auth import get_current_user


router = APIRouter(tags=["audit"])


class AuditEventOut(BaseModel):
    id: int
    ts: str
    actor_user_id: int | None
    action: str
    entity: str
    entity_id: str
    ip: str
    prev_hash: str
    entry_hash: str
    details_json: str


class AuditVerifyOut(BaseModel):
    ok: bool
    checked: int
    broken_at_id: int | None = None
    message: str


@router.get("/events", response_model=list[AuditEventOut])
def list_events(
    limit: int = 200,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[AuditEventOut]:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    limit = max(1, min(limit, 1000))
    rows = db.scalars(select(AuditEvent).order_by(AuditEvent.id.desc()).limit(limit)).all()
    return [
        AuditEventOut(
            id=r.id,
            ts=r.ts.isoformat(),
            actor_user_id=r.actor_user_id,
            action=r.action,
            entity=r.entity,
            entity_id=r.entity_id,
            ip=r.ip,
            prev_hash=r.prev_hash,
            entry_hash=r.entry_hash,
            details_json=r.details_json,
        )
        for r in rows
    ]


@router.get("/verify", response_model=AuditVerifyOut)
def verify_chain(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AuditVerifyOut:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    rows = db.scalars(select(AuditEvent).order_by(AuditEvent.id.asc())).all()
    prev_hash = ""
    checked = 0
    for r in rows:
        checked += 1
        if r.prev_hash != prev_hash:
            return AuditVerifyOut(
                ok=False,
                checked=checked,
                broken_at_id=r.id,
                message="Chain broken: prev_hash mismatch",
            )
        prev_hash = r.entry_hash
    return AuditVerifyOut(ok=True, checked=checked, broken_at_id=None, message="OK")


@router.get("/export.csv")
def export_csv(
    limit: int = 50000,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StreamingResponse:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    limit = max(1, min(limit, 200000))
    rows = db.scalars(select(AuditEvent).order_by(AuditEvent.id.asc()).limit(limit)).all()

    def gen():
        yield "id,ts,actor_user_id,action,entity,entity_id,ip,prev_hash,entry_hash,details_json\r\n"
        for r in rows:
            # naive CSV escaping (quotes doubled)
            def esc(s: str) -> str:
                s = s.replace('"', '""')
                return f"\"{s}\""

            yield (
                f"{r.id},"
                f"{esc(r.ts.isoformat())},"
                f"{'' if r.actor_user_id is None else r.actor_user_id},"
                f"{esc(r.action)},"
                f"{esc(r.entity)},"
                f"{esc(r.entity_id)},"
                f"{esc(r.ip or '')},"
                f"{esc(r.prev_hash or '')},"
                f"{esc(r.entry_hash or '')},"
                f"{esc(r.details_json or '{}')}"
                "\r\n"
            )

    headers = {"Content-Disposition": "attachment; filename=audit-events.csv"}
    return StreamingResponse(gen(), media_type="text/csv; charset=utf-8", headers=headers)


@router.get("/export.pdf")
def export_pdf(
    limit: int = 2000,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> StreamingResponse:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    limit = max(1, min(limit, 10000))
    rows = db.scalars(select(AuditEvent).order_by(AuditEvent.id.desc()).limit(limit)).all()

    from io import BytesIO

    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4

    y = height - 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "Journal d'audit — Export PDF (v1)")
    y -= 18
    c.setFont("Helvetica", 9)
    c.drawString(40, y, f"Événements exportés: {len(rows)} (dernier -> premier)")
    y -= 22

    c.setFont("Helvetica-Bold", 9)
    c.drawString(40, y, "id")
    c.drawString(70, y, "ts")
    c.drawString(170, y, "acteur")
    c.drawString(220, y, "action")
    c.drawString(280, y, "entité")
    c.drawString(360, y, "entity_id")
    c.drawString(440, y, "hash")
    y -= 14
    c.setFont("Helvetica", 8)

    for r in rows:
        if y < 50:
            c.showPage()
            y = height - 40
            c.setFont("Helvetica", 8)
        c.drawString(40, y, str(r.id))
        c.drawString(70, y, r.ts.isoformat(timespec="seconds"))
        c.drawString(170, y, "" if r.actor_user_id is None else str(r.actor_user_id))
        c.drawString(220, y, (r.action or "")[:10])
        c.drawString(280, y, (r.entity or "")[:12])
        c.drawString(360, y, (r.entity_id or "")[:12])
        c.drawString(440, y, (r.entry_hash or "")[:18] + "…")
        y -= 12

    c.setFont("Helvetica-Oblique", 8)
    c.drawString(40, 30, "Note: signature qualifiée/horodatage RFC3161 non inclus dans cette v1 (export technique).")
    c.save()
    buf.seek(0)

    headers = {"Content-Disposition": "attachment; filename=audit-events.pdf"}
    return StreamingResponse(buf, media_type="application/pdf", headers=headers)

