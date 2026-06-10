from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from analytics.kpi_car import car_evolucao_recebimentos, car_por_forma_pagamento, car_resumo_executivo
from analytics.kpi_financeiro_expandido import cap_fornecedores_top, cap_por_grupo_despesa
from database import get_db
from models.financeiro import ContaPagar, ContaReceber

router = APIRouter(prefix="/financeiro", tags=["financeiro"])


@router.get("/car")
def listar_car(
    empresa_id: int | None = None,
    status: str | None = None,
    faixa_aging: str | None = None,
    pagina: int = 1,
    tamanho: int = 50,
    db: Session = Depends(get_db),
) -> dict:
    query = db.query(ContaReceber)
    if empresa_id is not None:
        query = query.filter(ContaReceber.empresa_id == empresa_id)
    if status:
        query = query.filter(ContaReceber.status == status)
    if faixa_aging:
        query = query.filter(ContaReceber.faixa_aging == faixa_aging)
    total = query.count()
    items = query.offset((pagina - 1) * tamanho).limit(tamanho).all()
    return {"total": total, "pagina": pagina, "tamanho": tamanho, "items": [_serialize_car(item) for item in items]}


@router.get("/cap")
def listar_cap(
    empresa_id: int | None = None,
    status: str | None = None,
    pagina: int = 1,
    tamanho: int = 50,
    db: Session = Depends(get_db),
) -> dict:
    query = db.query(ContaPagar)
    if empresa_id is not None:
        query = query.filter(ContaPagar.empresa_id == empresa_id)
    if status:
        query = query.filter(ContaPagar.status == status)
    total = query.count()
    items = query.offset((pagina - 1) * tamanho).limit(tamanho).all()
    return {"total": total, "pagina": pagina, "tamanho": tamanho, "items": [_serialize_cap(item) for item in items]}


@router.get("/car/formas-pagamento")
def car_formas_pagamento(
    empresa_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    return car_por_forma_pagamento(db, empresa_id, data_inicio, data_fim)


@router.get("/car/evolucao-recebimentos")
def car_evolucao(
    empresa_id: int | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    return car_evolucao_recebimentos(db, empresa_id)


@router.get("/car/resumo-executivo")
def car_resumo(
    empresa_id: int | None = None,
    db: Session = Depends(get_db),
) -> dict:
    return car_resumo_executivo(db, empresa_id)


@router.get("/cap/grupos-despesa")
def cap_grupos_despesa(
    empresa_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    return cap_por_grupo_despesa(db, empresa_id, data_inicio, data_fim)


@router.get("/cap/fornecedores-top")
def cap_top_fornecedores(
    empresa_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    return cap_fornecedores_top(db, empresa_id, data_inicio, data_fim)


def _serialize_car(item: ContaReceber) -> dict:
    return {
        "id": item.id,
        "empresa_id": item.empresa_id,
        "cliente_id": item.cliente_id,
        "descricao": item.descricao,
        "valor_original": float(item.valor_original or 0),
        "valor_pago": float(item.valor_pago or 0),
        "data_vencimento": item.data_vencimento.isoformat() if item.data_vencimento else None,
        "data_pagamento": item.data_pagamento.isoformat() if item.data_pagamento else None,
        "status": item.status,
        "faixa_aging": item.faixa_aging,
    }


def _serialize_cap(item: ContaPagar) -> dict:
    return {
        "id": item.id,
        "empresa_id": item.empresa_id,
        "fornecedor_nome": item.fornecedor_nome,
        "descricao": item.descricao,
        "categoria_nome": item.categoria_nome,
        "centro_custo_nome": item.centro_custo_nome,
        "valor_original": float(item.valor_original or 0),
        "valor_pago": float(item.valor_pago or 0),
        "data_vencimento": item.data_vencimento.isoformat() if item.data_vencimento else None,
        "data_pagamento": item.data_pagamento.isoformat() if item.data_pagamento else None,
        "status": item.status,
    }
