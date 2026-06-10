from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.cliente import Cliente
from models.financeiro import ContaReceber

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.get("/inadimplentes")
def clientes_inadimplentes(
    empresa_id: int | None = None,
    faixa_dias: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    query = (
        db.query(
            Cliente.nome,
            Cliente.cpf_cnpj,
            func.coalesce(func.sum(ContaReceber.valor_original - ContaReceber.valor_pago), 0).label("saldo_aberto"),
            func.count(ContaReceber.id).label("qtde_titulos"),
        )
        .join(ContaReceber, ContaReceber.cliente_id == Cliente.id)
        .filter(ContaReceber.faixa_aging != "pago")
    )
    if empresa_id is not None:
        query = query.filter(ContaReceber.empresa_id == empresa_id)
    if faixa_dias is not None:
        query = query.filter(ContaReceber.faixa_aging == faixa_dias)

    rows = query.group_by(Cliente.nome, Cliente.cpf_cnpj).order_by(func.sum(ContaReceber.valor_original - ContaReceber.valor_pago).desc()).all()
    return [
        {
            "cliente_nome": row.nome,
            "cpf_cnpj": row.cpf_cnpj,
            "saldo_aberto": float(row.saldo_aberto or 0),
            "qtde_titulos": int(row.qtde_titulos or 0),
        }
        for row in rows
    ]
