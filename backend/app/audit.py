from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AuditEvent


def _sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def append_audit_event(
    *,
    db: Session,
    actor_user_id: int | None,
    action: str,
    entity: str,
    entity_id: str,
    ip: str = "",
    details: dict | None = None,
) -> AuditEvent:
    details = details or {}
    prev = db.scalar(select(AuditEvent).order_by(AuditEvent.id.desc()).limit(1))
    prev_hash = prev.entry_hash if prev else ""

    ts = datetime.now(timezone.utc)
    payload = {
        "ts": ts.isoformat(),
        "actor_user_id": actor_user_id,
        "action": action,
        "entity": entity,
        "entity_id": entity_id,
        "ip": ip,
        "details": details,
        "prev_hash": prev_hash,
    }
    entry_hash = _sha256_hex(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8"))

    ev = AuditEvent(
        actor_user_id=actor_user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        ip=ip,
        details_json=json.dumps(details, sort_keys=True),
        prev_hash=prev_hash,
        entry_hash=entry_hash,
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

