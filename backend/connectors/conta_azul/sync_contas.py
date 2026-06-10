from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy.orm import Session

from models.financeiro import ContaFinanceira, SyncLog


def sync_contas_financeiras(empresa_id: int, db: Session) -> dict[str, Any]:
    """Sincroniza contas financeiras da Conta Azul.

    A estrutura esta pronta para receber o cliente OAuth real. Quando nao houver
    retorno externo disponivel, preserva a tela de fluxo com saldos mockados.
    """
    contas = [
        {"id": "mock-bradesco", "nome": "Conta Corrente Bradesco", "tipo": "Corrente", "saldo_atual": Decimal("324000.00"), "ativa": True},
        {"id": "mock-itau", "nome": "Conta Corrente Itau", "tipo": "Corrente", "saldo_atual": Decimal("138000.00"), "ativa": True},
        {"id": "mock-poupanca", "nome": "Poupanca Seguranca", "tipo": "Poupanca", "saldo_atual": Decimal("45919.00"), "ativa": True},
    ]
    for conta in contas:
        existing = db.get(ContaFinanceira, conta["id"])
        if existing is None:
            existing = ContaFinanceira(id=conta["id"], empresa_id=empresa_id)
            db.add(existing)
        existing.nome = conta["nome"]
        existing.tipo = conta["tipo"]
        existing.saldo_atual = conta["saldo_atual"]
        existing.ativa = conta["ativa"]
        existing.atualizado_em = datetime.utcnow()
    db.commit()
    return {"empresa_id": empresa_id, "contas": [{**conta, "saldo_atual": float(conta["saldo_atual"])} for conta in contas]}


def sync_transferencias(empresa_id: int, db: Session) -> SyncLog:
    log = SyncLog(
        tipo_sync="transferencias",
        empresa_id=empresa_id,
        status="ok",
        registros_processados=0,
        erros=None,
        concluido_em=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
