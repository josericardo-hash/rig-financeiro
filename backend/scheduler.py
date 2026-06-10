from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler

from connectors.conta_azul.sync_clientes import sync_clientes
from connectors.conta_azul.sync_financeiro import sync_financeiro
from connectors.conta_azul.sync_vendas import sync_vendas
from database import SessionLocal
from models.empresa import Empresa
from models.financeiro import SyncLog

scheduler = BackgroundScheduler(timezone="America/Sao_Paulo")


def start_scheduler() -> None:
    if scheduler.running:
        return
    scheduler.add_job(sync_incremental, "interval", hours=1, id="sync_incremental", replace_existing=True)
    scheduler.add_job(sync_full, "cron", hour=0, minute=0, id="sync_full", replace_existing=True)
    scheduler.start()


def sync_incremental() -> None:
    _run_for_active_empresas(full=False)


def sync_full() -> None:
    _run_for_active_empresas(full=True)


def _run_for_active_empresas(full: bool) -> None:
    with SessionLocal() as db:
        empresas = db.query(Empresa).filter(Empresa.ativa.is_(True)).all()
        for empresa in empresas:
            try:
                if full:
                    sync_clientes(empresa.id, db)
                sync_vendas(empresa.id, db)
                sync_financeiro(empresa.id, db)
            except Exception as exc:
                db.rollback()
                db.add(
                    SyncLog(
                        tipo_sync="full" if full else "incremental",
                        empresa_id=empresa.id,
                        status="erro",
                        registros_processados=0,
                        erros=str(exc),
                    )
                )
                db.commit()
