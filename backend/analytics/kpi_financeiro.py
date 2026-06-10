from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.venda import Venda


def calcular_receita(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    query = _base_vendas_query(db, empresa_id, data_inicio, data_fim)
    row = query.with_entities(
        func.coalesce(func.sum(Venda.valor_bruto), 0),
        func.coalesce(func.sum(Venda.valor_liquido), 0),
        func.coalesce(func.sum(Venda.valor_desconto), 0),
        func.coalesce(func.sum(Venda.valor_frete), 0),
        func.count(Venda.id),
    ).one()
    return {
        "receita_bruta": _float(row[0]),
        "receita_liquida": _float(row[1]),
        "total_descontos": _float(row[2]),
        "total_frete_cobrado": _float(row[3]),
        "qtde_vendas": int(row[4] or 0),
    }


def calcular_margem(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    query = _base_vendas_query(db, empresa_id, data_inicio, data_fim)
    row = query.with_entities(
        func.coalesce(func.sum(Venda.valor_liquido), 0),
        func.coalesce(func.sum(Venda.custo_total), 0),
    ).one()
    receita_liquida = Decimal(row[0] or 0)
    custo_total = Decimal(row[1] or 0)
    lucro_bruto = receita_liquida - custo_total
    return calcular_margem_por_valores(receita_liquida, custo_total) | {
        "lucro_bruto": _float(lucro_bruto),
        "custo_total": _float(custo_total),
    }


def calcular_ticket_medio(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    query = _base_vendas_query(db, empresa_id, data_inicio, data_fim)
    row = query.with_entities(
        func.coalesce(func.sum(Venda.valor_liquido), 0),
        func.count(Venda.id),
        func.coalesce(func.sum(Venda.qtde_itens), 0),
    ).one()
    receita_liquida = Decimal(row[0] or 0)
    qtde_vendas = int(row[1] or 0)
    qtde_itens = int(row[2] or 0)
    return {
        "ticket_medio": _float(receita_liquida / qtde_vendas) if qtde_vendas else 0.0,
        "ticket_medio_por_item": _float(receita_liquida / qtde_itens) if qtde_itens else 0.0,
    }


def calcular_margem_por_valores(receita_liquida: Decimal, custo_total: Decimal) -> dict:
    lucro_bruto = receita_liquida - custo_total
    margem = (lucro_bruto / receita_liquida * Decimal("100")) if receita_liquida else Decimal("0")
    return {"margem_bruta_percentual": _float(margem)}


def _base_vendas_query(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date):
    query = db.query(Venda).filter(Venda.data_venda >= data_inicio, Venda.data_venda <= data_fim)
    if empresa_id is not None:
        query = query.filter(Venda.empresa_id == empresa_id)
    return query


def _float(value: Decimal | int | float | None) -> float:
    return float(value or 0)
