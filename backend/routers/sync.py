from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from connectors.conta_azul.sync_clientes import sync_clientes
from connectors.conta_azul.sync_financeiro import sync_financeiro
from connectors.conta_azul.sync_vendas import sync_vendas
from database import get_db
from models.empresa import Empresa
from models.financeiro import SyncLog

router = APIRouter(prefix="/sync", tags=["sync"])


class SyncTriggerRequest(BaseModel):
    empresa_id: int | None = None
    tipo: str


@router.post("/trigger")
def trigger_sync(payload: SyncTriggerRequest, db: Session = Depends(get_db)) -> dict:
    empresas = _empresas_alvo(db, payload.empresa_id)
    logs = []
    for empresa in empresas:
        if payload.tipo == "full":
            logs.append(_serialize_sync_log(sync_clientes(empresa.id, db)))
        logs.append(_serialize_sync_log(sync_vendas(empresa.id, db)))
        logs.append(_serialize_sync_log(sync_financeiro(empresa.id, db)))
    return {"logs": logs}


@router.get("/status")
def sync_status(db: Session = Depends(get_db)) -> list[dict]:
    logs = db.query(SyncLog).order_by(SyncLog.iniciado_em.desc()).limit(10).all()
    return [_serialize_sync_log(log) for log in logs]


def _empresas_alvo(db: Session, empresa_id: int | None) -> list[Empresa]:
    query = db.query(Empresa).filter(Empresa.ativa.is_(True))
    if empresa_id is not None:
        query = query.filter(Empresa.id == empresa_id)
    return query.all()


def _serialize_sync_log(log: SyncLog) -> dict:
    return {
        "id": log.id,
        "tipo_sync": log.tipo_sync,
        "empresa_id": log.empresa_id,
        "status": log.status,
        "registros_processados": log.registros_processados,
        "erros": log.erros,
        "iniciado_em": log.iniciado_em.isoformat() if log.iniciado_em else None,
        "concluido_em": log.concluido_em.isoformat() if log.concluido_em else None,
    }
