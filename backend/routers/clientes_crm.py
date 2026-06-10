from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.cliente import Cliente
from models.venda import ItemVenda, Venda

router = APIRouter(prefix="/crm", tags=["crm"])


@router.get("/clientes")
def listar_clientes(perfil: str | None = None, estado: str | None = None, curva_abc: str | None = None, produto: str | None = None, pagina: int = 1, tamanho: int = 50, db: Session = Depends(get_db)):
    query = db.query(Cliente)
    if perfil and perfil != "todos":
        query = query.filter(Cliente.perfil_publico == perfil)
    if estado:
        query = query.filter(Cliente.endereco_estado == estado)
    if curva_abc:
        query = query.filter(Cliente.curva_abc == curva_abc)
    if produto:
        query = query.join(Venda, Venda.cliente_id == Cliente.id).join(ItemVenda, ItemVenda.venda_id == Venda.id).filter(ItemVenda.produto_nome.ilike(f"%{produto}%"))
    total = query.count()
    rows = query.offset((pagina - 1) * tamanho).limit(tamanho).all()
    return {"total": total, "pagina": pagina, "tamanho": tamanho, "items": [_cliente(c) for c in rows]}


@router.get("/clientes/{cliente_id}")
def detalhe_cliente(cliente_id: str, db: Session = Depends(get_db)):
    cliente = db.get(Cliente, cliente_id)
    return _cliente(cliente) if cliente else {}


@router.get("/clientes/{cliente_id}/compras")
def compras_cliente(cliente_id: str, db: Session = Depends(get_db)):
    return [{"id": v.id, "data_venda": v.data_venda.isoformat() if v.data_venda else None, "valor_liquido": float(v.valor_liquido or 0), "status": v.situacao, "vendedor": v.vendedor_nome} for v in db.query(Venda).filter(Venda.cliente_id == cliente_id).all()]


@router.get("/clientes/{cliente_id}/produtos")
def produtos_cliente(cliente_id: str, db: Session = Depends(get_db)):
    rows = db.query(ItemVenda.produto_nome, ItemVenda.quantidade, ItemVenda.valor_total, Venda.data_venda).join(Venda, Venda.id == ItemVenda.venda_id).filter(Venda.cliente_id == cliente_id).all()
    return [{"produto": r[0], "qtde": float(r[1] or 0), "valor": float(r[2] or 0), "data_ultima_compra": r[3].isoformat() if r[3] else None} for r in rows]


def _cliente(c: Cliente | None) -> dict:
    if c is None:
        return {}
    return {"id": c.id, "nome": c.nome, "perfil": c.perfil_publico, "tipo_pessoa": c.tipo_pessoa, "cidade": c.endereco_cidade, "estado": c.endereco_estado, "total_compras": c.total_compras or 0, "valor_total_comprado": float(c.valor_total_comprado or 0), "curva_abc": c.curva_abc, "email": c.email, "whatsapp": c.whatsapp, "telefone": c.telefone_celular or c.telefone_comercial or c.telefone, "ultima_compra": c.ultima_compra.isoformat() if c.ultima_compra else None}
