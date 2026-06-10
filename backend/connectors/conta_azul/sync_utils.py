from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Any

from sqlalchemy.orm import Session

from models.financeiro import SyncLog


def as_decimal(value: Any) -> Decimal | None:
    if value in (None, ""):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def as_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def as_date(value: Any) -> date | None:
    parsed = as_datetime(value)
    return parsed.date() if parsed else None


def as_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time())
    if not value:
        return None
    text = str(value).replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
        return parsed.replace(tzinfo=None)
    except ValueError:
        return None


def get_nested(payload: dict, *keys: str, default: Any = None) -> Any:
    current: Any = payload
    for key in keys:
        if not isinstance(current, dict):
            return default
        current = current.get(key)
    return current if current is not None else default


def start_sync_log(db: Session, tipo_sync: str, empresa_id: int | None) -> SyncLog:
    sync_log = SyncLog(
        tipo_sync=tipo_sync,
        empresa_id=empresa_id,
        status="em_execucao",
        registros_processados=0,
        iniciado_em=datetime.utcnow(),
    )
    db.add(sync_log)
    db.commit()
    db.refresh(sync_log)
    return sync_log


def finish_sync_log(
    db: Session,
    sync_log: SyncLog,
    status: str,
    registros_processados: int,
    erros: str | None = None,
) -> SyncLog:
    sync_log.status = status
    sync_log.registros_processados = registros_processados
    sync_log.erros = erros
    sync_log.concluido_em = datetime.utcnow()
    db.commit()
    db.refresh(sync_log)
    return sync_log
