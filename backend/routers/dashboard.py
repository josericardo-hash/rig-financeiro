from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from analytics.forecast import calcular_forecast
from analytics.kpi_car import calcular_aging, calcular_cash_in, calcular_top_devedores
from analytics.kpi_financeiro import calcular_margem, calcular_receita, calcular_ticket_medio
from database import get_db
from models.financeiro import SyncLog

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/resumo")
def dashboard_resumo(
    empresa_id: int | None = None,
    data_inicio: date = Query(...),
    data_fim: date = Query(...),
    db: Session = Depends(get_db),
) -> dict:
    ultima = (
        db.query(SyncLog)
        .filter(SyncLog.status == "sucesso")
        .order_by(SyncLog.concluido_em.desc())
        .first()
    )
    return {
        "kpis_financeiros": {
            "receita": calcular_receita(db, empresa_id, data_inicio, data_fim),
            "margem": calcular_margem(db, empresa_id, data_inicio, data_fim),
            "ticket": calcular_ticket_medio(db, empresa_id, data_inicio, data_fim),
        },
        "kpis_car": {
            "aging": calcular_aging(db, empresa_id),
            "top_devedores": calcular_top_devedores(db, empresa_id),
            "cash_in": calcular_cash_in(db, empresa_id, data_inicio, data_fim),
        },
        "forecast": calcular_forecast(db, empresa_id),
        "ultima_atualizacao": ultima.concluido_em.isoformat() if ultima and ultima.concluido_em else None,
    }
