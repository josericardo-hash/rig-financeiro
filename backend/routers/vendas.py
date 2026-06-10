from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.empresa import Empresa
from models.venda import Venda

router = APIRouter(prefix="/vendas", tags=["vendas"])


@router.get("")
def listar_vendas(
    empresa_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    pagina: int = 1,
    tamanho: int = 50,
    db: Session = Depends(get_db),
) -> dict:
    query = _filter_vendas(db, empresa_id, data_inicio, data_fim)
    total = query.count()
    items = query.offset((pagina - 1) * tamanho).limit(tamanho).all()
    return {"total": total, "pagina": pagina, "tamanho": tamanho, "items": [_serialize_venda(item) for item in items]}


@router.get("/por-empresa")
def vendas_por_empresa(db: Session = Depends(get_db)) -> list[dict]:
    rows = (
        db.query(Empresa.nome, func.count(Venda.id), func.coalesce(func.sum(Venda.valor_liquido), 0))
        .join(Venda, Venda.empresa_id == Empresa.id)
        .group_by(Empresa.nome)
        .order_by(func.sum(Venda.valor_liquido).desc())
        .all()
    )
    return [{"empresa": nome, "qtde_vendas": int(qtde), "receita_liquida": float(valor or 0)} for nome, qtde, valor in rows]


@router.get("/ranking-vendedores")
def ranking_vendedores(
    data_inicio: date | None = None,
    data_fim: date | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    query = _filter_vendas(db, None, data_inicio, data_fim)
    rows = (
        query.with_entities(
            Venda.vendedor_nome,
            func.count(Venda.id),
            func.coalesce(func.sum(Venda.valor_liquido), 0),
        )
        .filter(Venda.vendedor_nome.is_not(None))
        .group_by(Venda.vendedor_nome)
        .order_by(func.sum(Venda.valor_liquido).desc())
        .all()
    )
    return [{"vendedor_nome": nome, "qtde_vendas": int(qtde), "receita_liquida": float(valor or 0)} for nome, qtde, valor in rows]


def _filter_vendas(db: Session, empresa_id: int | None, data_inicio: date | None, data_fim: date | None):
    query = db.query(Venda)
    if empresa_id is not None:
        query = query.filter(Venda.empresa_id == empresa_id)
    if data_inicio is not None:
        query = query.filter(Venda.data_venda >= data_inicio)
    if data_fim is not None:
        query = query.filter(Venda.data_venda <= data_fim)
    return query


def _serialize_venda(item: Venda) -> dict:
    return {
        "id": item.id,
        "numero": item.numero,
        "empresa_id": item.empresa_id,
        "cliente_id": item.cliente_id,
        "data_venda": item.data_venda.isoformat() if item.data_venda else None,
        "situacao": item.situacao,
        "valor_bruto": float(item.valor_bruto or 0),
        "valor_liquido": float(item.valor_liquido or 0),
        "valor_desconto": float(item.valor_desconto or 0),
        "valor_frete": float(item.valor_frete or 0),
        "custo_total": float(item.custo_total or 0),
        "margem_bruta": float(item.margem_bruta or 0),
        "qtde_itens": item.qtde_itens,
        "vendedor_nome": item.vendedor_nome,
    }
