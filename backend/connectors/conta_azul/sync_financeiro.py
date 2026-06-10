from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from connectors.conta_azul.client import ContaAzulClient
from connectors.conta_azul.sync_utils import (
    as_date,
    as_decimal,
    finish_sync_log,
    get_nested,
    start_sync_log,
)
from models.financeiro import ContaPagar, ContaReceber, SyncLog


def sync_financeiro(empresa_id: int, db: Session) -> SyncLog:
    sync_log = start_sync_log(db, "financeiro", empresa_id)
    processed = 0
    try:
        client = ContaAzulClient(db=db)
        movimentos = client.get_paginated(
            "/v1/financeiro/movimentacoes",
            empresa_id,
            {"tipo": "RECEBER,PAGAR"},
        )
        for item in movimentos:
            tipo = str(item.get("tipo") or item.get("natureza") or "").upper()
            descricao = item.get("descricao") or item.get("observacao") or ""

            if "RECEBER" in tipo:
                if is_mutuo(descricao):
                    continue
                _upsert_conta_receber(db, empresa_id, item, descricao)
            elif "PAGAR" in tipo:
                _upsert_conta_pagar(db, empresa_id, item, descricao)
            else:
                continue

            processed += 1
            if processed % 100 == 0:
                db.commit()

        db.commit()
        return finish_sync_log(db, sync_log, "sucesso", processed)
    except Exception as exc:
        db.rollback()
        return finish_sync_log(db, sync_log, "erro", processed, str(exc))


def is_mutuo(descricao: str | None) -> bool:
    text = (descricao or "").lower()
    return "mutuo" in text or "mutuo" in text.replace("ú", "u")


def calcular_faixa_aging(status: str | None, data_vencimento: date | None, data_pagamento: date | None) -> str:
    if data_pagamento is not None or (status or "").upper() == "PAGO":
        return "pago"
    if data_vencimento is None:
        return "corrente"

    dias_atraso = (date.today() - data_vencimento).days
    if dias_atraso <= 0:
        return "corrente"
    if dias_atraso <= 30:
        return "1-30"
    if dias_atraso <= 60:
        return "31-60"
    if dias_atraso <= 90:
        return "61-90"
    return "90+"


def _upsert_conta_receber(db: Session, empresa_id: int, item: dict, descricao: str) -> None:
    movimento_id = str(item.get("id") or item.get("uuid"))
    conta = db.get(ContaReceber, movimento_id)
    if conta is None:
        conta = ContaReceber(id=movimento_id, empresa_id=empresa_id)
        db.add(conta)

    status = item.get("status") or item.get("situacao")
    data_vencimento = as_date(item.get("data_vencimento") or item.get("vencimento"))
    data_pagamento = as_date(item.get("data_pagamento") or item.get("pagamento"))

    conta.empresa_id = empresa_id
    conta.cliente_id = str(get_nested(item, "cliente", "id")) if get_nested(item, "cliente", "id") else item.get("cliente_id")
    conta.descricao = descricao
    conta.valor_original = as_decimal(item.get("valor_original") or item.get("valor")) or Decimal("0")
    conta.valor_pago = as_decimal(item.get("valor_pago") or item.get("valor_recebido")) or Decimal("0")
    conta.data_vencimento = data_vencimento
    conta.data_pagamento = data_pagamento
    conta.status = status
    conta.faixa_aging = calcular_faixa_aging(status, data_vencimento, data_pagamento)


def _upsert_conta_pagar(db: Session, empresa_id: int, item: dict, descricao: str) -> None:
    movimento_id = str(item.get("id") or item.get("uuid"))
    conta = db.get(ContaPagar, movimento_id)
    if conta is None:
        conta = ContaPagar(id=movimento_id, empresa_id=empresa_id)
        db.add(conta)

    conta.empresa_id = empresa_id
    conta.fornecedor_nome = item.get("fornecedor_nome") or get_nested(item, "fornecedor", "nome")
    conta.descricao = descricao
    conta.categoria_nome = item.get("categoria_nome") or get_nested(item, "categoria", "nome")
    conta.centro_custo_nome = item.get("centro_custo_nome") or get_nested(item, "centro_custo", "nome")
    conta.valor_original = as_decimal(item.get("valor_original") or item.get("valor")) or Decimal("0")
    conta.valor_pago = as_decimal(item.get("valor_pago")) or Decimal("0")
    conta.data_vencimento = as_date(item.get("data_vencimento") or item.get("vencimento"))
    conta.data_pagamento = as_date(item.get("data_pagamento") or item.get("pagamento"))
    conta.status = item.get("status") or item.get("situacao")
