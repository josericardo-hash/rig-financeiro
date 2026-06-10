from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from connectors.conta_azul.client import ContaAzulClient
from connectors.conta_azul.sync_utils import (
    as_date,
    as_datetime,
    as_decimal,
    as_int,
    finish_sync_log,
    get_nested,
    start_sync_log,
)
from models.financeiro import SyncLog
from models.cliente import Cliente
from models.venda import ItemVenda, Venda


def sync_vendas(empresa_id: int, db: Session) -> SyncLog:
    sync_log = start_sync_log(db, "vendas", empresa_id)
    processed = 0
    try:
        client = ContaAzulClient(db=db)
        vendas = client.get_paginated("/v1/venda", empresa_id, {"situacao": "Aprovado,Faturado"})
        for item in vendas:
            venda_id = item.get("id") or item.get("uuid")
            if not venda_id:
                continue

            incoming_updated_at = as_datetime(item.get("data_atualizacao") or item.get("updated_at"))
            venda = db.get(Venda, str(venda_id))
            if venda and venda.data_atualizacao and incoming_updated_at and venda.data_atualizacao >= incoming_updated_at:
                continue
            if venda is None:
                venda = Venda(id=str(venda_id), empresa_id=empresa_id, data_venda=as_date(item.get("data_venda")) or as_date(item.get("data")) )
                db.add(venda)

            valor_liquido = as_decimal(item.get("valor_liquido") or item.get("total") or item.get("valor"))
            custo_total = as_decimal(item.get("custo_total") or item.get("custo"))

            venda.numero = as_int(item.get("numero"))
            venda.empresa_id = empresa_id
            venda.cliente_id = str(get_nested(item, "cliente", "id")) if get_nested(item, "cliente", "id") else item.get("cliente_id")
            venda.data_venda = as_date(item.get("data_venda") or item.get("data")) or venda.data_venda
            venda.situacao = item.get("situacao") or item.get("status")
            venda.valor_bruto = as_decimal(item.get("valor_bruto") or item.get("subtotal"))
            venda.valor_liquido = valor_liquido
            venda.valor_desconto = as_decimal(item.get("valor_desconto") or item.get("desconto")) or Decimal("0")
            venda.valor_frete = as_decimal(item.get("valor_frete") or item.get("frete")) or Decimal("0")
            venda.custo_total = custo_total
            venda.margem_bruta = _calcular_margem_bruta(valor_liquido, custo_total)
            venda.qtde_itens = as_int(item.get("qtde_itens") or item.get("quantidade_itens"))
            venda.vendedor_nome = item.get("vendedor_nome") or get_nested(item, "vendedor", "nome")
            cpf_cnpj = str(get_nested(item, "cliente", "cpf_cnpj", default="") or "")
            digits = "".join(filter(str.isdigit, cpf_cnpj))
            venda.cliente_cidade = get_nested(item, "cliente", "cidade", default="")
            venda.cliente_estado = get_nested(item, "cliente", "estado", default="")
            venda.cliente_tipo = "PJ" if len(digits) == 14 else "PF"
            venda.perfil_publico = "B2B" if venda.cliente_tipo == "PJ" else "B2C"
            venda.data_atualizacao = incoming_updated_at
            sync_itens_venda(str(venda_id), empresa_id, db, client)
            processed += 1

            if processed % 100 == 0:
                db.commit()

        db.commit()
        atualizar_metricas_clientes(db, empresa_id)
        return finish_sync_log(db, sync_log, "sucesso", processed)
    except Exception as exc:
        db.rollback()
        return finish_sync_log(db, sync_log, "erro", processed, str(exc))


def _calcular_margem_bruta(valor_liquido: Decimal | None, custo_total: Decimal | None) -> Decimal | None:
    if not valor_liquido or not custo_total or custo_total <= 0:
        return None
    return (valor_liquido - custo_total) / valor_liquido


def sync_itens_venda(venda_id: str, empresa_id: int, db: Session, client: ContaAzulClient | None = None) -> None:
    client = client or ContaAzulClient(db=db)
    payload = client.get(f"/v1/venda/{venda_id}/itens", empresa_id)
    itens = payload if isinstance(payload, list) else payload.get("items", payload.get("data", []))
    for index, item in enumerate(itens):
        item_id = str(item.get("id") or item.get("uuid") or f"{venda_id}-{index}")
        registro = db.get(ItemVenda, item_id)
        if registro is None:
            registro = ItemVenda(id=item_id, venda_id=venda_id, empresa_id=empresa_id)
            db.add(registro)
        quantidade = as_decimal(item.get("quantidade")) or Decimal("0")
        valor_unitario = as_decimal(item.get("valor_unitario") or item.get("valor")) or Decimal("0")
        valor_total = as_decimal(item.get("valor_total")) or (quantidade * valor_unitario)
        custo_unitario = as_decimal(item.get("custo_unitario") or item.get("custo")) or Decimal("0")
        custo_total = as_decimal(item.get("custo_total")) or (quantidade * custo_unitario)
        registro.produto_nome = item.get("nome") or item.get("produto_nome")
        registro.produto_codigo = item.get("codigo") or item.get("produto_codigo")
        registro.tipo = item.get("tipo")
        registro.quantidade = quantidade
        registro.valor_unitario = valor_unitario
        registro.valor_total = valor_total
        registro.custo_unitario = custo_unitario
        registro.custo_total = custo_total
        registro.margem_item = ((valor_total - custo_total) / valor_total) if valor_total > 0 else None


def atualizar_metricas_clientes(db: Session, empresa_id: int) -> None:
    rows = (
        db.query(
            Venda.cliente_id,
            func.count(Venda.id),
            func.coalesce(func.sum(Venda.valor_liquido), 0),
            func.max(Venda.data_venda),
        )
        .filter(Venda.empresa_id == empresa_id, Venda.cliente_id.is_not(None))
        .group_by(Venda.cliente_id)
        .all()
    )
    for cliente_id, total, valor, ultima in rows:
        cliente = db.get(Cliente, cliente_id)
        if cliente:
            cliente.total_compras = int(total or 0)
            cliente.valor_total_comprado = valor
            cliente.ultima_compra = ultima
    db.commit()
