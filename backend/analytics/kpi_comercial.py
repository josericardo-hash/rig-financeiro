from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.cliente import Cliente
from models.venda import ItemVenda, Venda

UF_NOMES = {
    "SP": "São Paulo", "RJ": "Rio de Janeiro", "MG": "Minas Gerais", "PR": "Paraná",
    "RS": "Rio Grande do Sul", "SC": "Santa Catarina", "BA": "Bahia", "GO": "Goiás",
}


def vendas_por_produto(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> list:
    rows = _itens_periodo(db, empresa_id, data_inicio, data_fim).with_entities(
        ItemVenda.produto_nome, ItemVenda.tipo, func.sum(ItemVenda.quantidade),
        func.sum(ItemVenda.valor_total), func.sum(ItemVenda.custo_total),
    ).group_by(ItemVenda.produto_nome, ItemVenda.tipo).order_by(func.sum(ItemVenda.valor_total).desc()).all()
    total_receita = sum(Decimal(r[3] or 0) for r in rows) or Decimal("1")
    out = []
    acumulado = Decimal("0")
    for idx, row in enumerate(rows, 1):
        receita = Decimal(row[3] or 0)
        custo = Decimal(row[4] or 0)
        acumulado += receita
        out.append({
            "ranking": idx, "produto": row[0], "tipo": row[1], "qtde_vendida": float(row[2] or 0),
            "receita_total": float(receita), "custo_total": float(custo),
            "margem_pct": _pct(receita - custo, receita), "participacao_pct": _pct(receita, total_receita),
            "curva_abc": _curva(acumulado / total_receita),
        })
    return out


def vendas_por_tipo_produto(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> list:
    rows = _itens_periodo(db, empresa_id, data_inicio, data_fim).with_entities(
        ItemVenda.tipo, func.sum(ItemVenda.quantidade), func.sum(ItemVenda.valor_total)
    ).group_by(ItemVenda.tipo).all()
    total = sum(Decimal(r[2] or 0) for r in rows) or Decimal("1")
    return [{"tipo": r[0] or "N/I", "qtde": float(r[1] or 0), "receita": float(r[2] or 0), "participacao_pct": _pct(Decimal(r[2] or 0), total)} for r in rows]


def clientes_por_produto(db: Session, empresa_id: int | None, produto_nome: str, perfil=None, data_inicio=None, data_fim=None) -> list:
    query = db.query(Cliente, Venda, ItemVenda).join(Venda, Venda.cliente_id == Cliente.id).join(ItemVenda, ItemVenda.venda_id == Venda.id).filter(ItemVenda.produto_nome == produto_nome)
    if empresa_id is not None:
        query = query.filter(Venda.empresa_id == empresa_id)
    if perfil and perfil != "todos":
        query = query.filter(Cliente.perfil_publico == perfil)
    if data_inicio:
        query = query.filter(Venda.data_venda >= data_inicio)
    if data_fim:
        query = query.filter(Venda.data_venda <= data_fim)
    grouped: dict[str, dict] = {}
    for cliente, venda, item in query.all():
        row = grouped.setdefault(cliente.id, _cliente_base(cliente))
        row["qtde_comprada"] += float(item.quantidade or 0)
        row["valor_total"] += float(item.valor_total or 0)
        row["ultima_compra"] = max(row["ultima_compra"] or venda.data_venda, venda.data_venda).isoformat()
        row["vendedor_nome"] = venda.vendedor_nome
    return list(grouped.values())


def vendas_por_estado(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> list:
    rows = _vendas_periodo(db, empresa_id, data_inicio, data_fim).with_entities(
        Venda.cliente_estado, func.count(Venda.id), func.sum(Venda.valor_liquido), func.sum(Venda.custo_total)
    ).group_by(Venda.cliente_estado).all()
    total = sum(Decimal(r[2] or 0) for r in rows) or Decimal("1")
    return [{"uf": r[0] or "NI", "nome_estado": UF_NOMES.get(r[0] or "", r[0] or "Não informado"), "qtde_vendas": int(r[1] or 0), "receita": float(r[2] or 0), "ticket_medio": float(Decimal(r[2] or 0) / Decimal(r[1] or 1)), "margem_pct": _pct(Decimal(r[2] or 0) - Decimal(r[3] or 0), Decimal(r[2] or 0)), "participacao_pct": _pct(Decimal(r[2] or 0), total), "crescimento_mom": 0.0} for r in rows]


def vendas_por_cidade(db: Session, empresa_id: int | None, estado: str, data_inicio: date, data_fim: date) -> list:
    rows = _vendas_periodo(db, empresa_id, data_inicio, data_fim).filter(Venda.cliente_estado == estado).with_entities(
        Venda.cliente_cidade, func.count(Venda.id), func.sum(Venda.valor_liquido)
    ).group_by(Venda.cliente_cidade).all()
    total = sum(Decimal(r[2] or 0) for r in rows) or Decimal("1")
    return [{"cidade": r[0] or "Não informada", "uf": estado, "qtde_vendas": int(r[1] or 0), "receita": float(r[2] or 0), "ticket_medio": float(Decimal(r[2] or 0) / Decimal(r[1] or 1)), "participacao_pct": _pct(Decimal(r[2] or 0), total)} for r in rows]


def detalhe_cidade(db: Session, empresa_id: int | None, estado: str, cidade: str, data_inicio: date, data_fim: date) -> dict:
    vendas = _vendas_periodo(db, empresa_id, data_inicio, data_fim).filter(Venda.cliente_estado == estado, Venda.cliente_cidade == cidade)
    clientes = [{"cliente_nome": v.cliente.nome if v.cliente else None, "perfil": v.perfil_publico, "receita": float(v.valor_liquido or 0), "email": v.cliente.email if v.cliente else None, "whatsapp": v.cliente.whatsapp if v.cliente else None} for v in vendas.all()]
    return {"cidade": cidade, "estado": estado, "receita": sum(c["receita"] for c in clientes), "qtde_vendas": len(clientes), "clientes": clientes, "top_produtos": []}


def vendas_b2b_b2c(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    rows = _vendas_periodo(db, empresa_id, data_inicio, data_fim).with_entities(Venda.perfil_publico, func.count(Venda.id), func.sum(Venda.valor_liquido)).group_by(Venda.perfil_publico).all()
    result = {"b2b": {"receita": 0, "qtde_vendas": 0}, "b2c": {"receita": 0, "qtde_vendas": 0}, "top_produtos_b2b": [], "top_produtos_b2c": []}
    for perfil, qtde, receita in rows:
        key = "b2b" if perfil == "B2B" else "b2c"
        result[key] = {"receita": float(receita or 0), "qtde_vendas": int(qtde or 0)}
    return result


def top_produtos_por_publico(db: Session, empresa_id: int | None, perfil: str, data_inicio: date, data_fim: date) -> list:
    return [p for p in vendas_por_produto(db, empresa_id, data_inicio, data_fim)][:10]


def curva_abc_clientes(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    rows = _vendas_periodo(db, empresa_id, data_inicio, data_fim).join(Cliente, Cliente.id == Venda.cliente_id).with_entities(Cliente, func.sum(Venda.valor_liquido)).group_by(Cliente.id).order_by(func.sum(Venda.valor_liquido).desc()).all()
    total = sum(Decimal(r[1] or 0) for r in rows) or Decimal("1")
    acc = Decimal("0")
    items = []
    for cliente, receita in rows:
        acc += Decimal(receita or 0)
        base = _cliente_base(cliente)
        base.update({"classificacao": _curva(acc / total), "receita": float(receita or 0), "participacao": _pct(Decimal(receita or 0), total)})
        items.append(base)
    return {"clientes": items}


def curva_abc_produtos(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    return {"produtos": vendas_por_produto(db, empresa_id, data_inicio, data_fim)}


def sazonalidade_vendas(db: Session, empresa_id: int | None) -> list:
    query = db.query(func.to_char(Venda.data_venda, "YYYY-MM"), func.sum(Venda.valor_liquido), func.count(Venda.id))
    if empresa_id is not None:
        query = query.filter(Venda.empresa_id == empresa_id)
    query = query.group_by(func.to_char(Venda.data_venda, "YYYY-MM")).order_by(func.to_char(Venda.data_venda, "YYYY-MM")).limit(12)
    prev = None
    out = []
    for mes, receita, qtde in query.all():
        receita_d = Decimal(receita or 0)
        out.append({"mes": mes, "receita": float(receita_d), "qtde_vendas": int(qtde or 0), "variacao_mom_pct": _pct(receita_d - prev, prev) if prev else 0.0})
        prev = receita_d
    return out


def concentracao_clientes(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    clientes = curva_abc_clientes(db, empresa_id, data_inicio, data_fim)["clientes"]
    total = sum(c["receita"] for c in clientes) or 1
    return {f"top_{n}": sum(c["receita"] for c in clientes[:n]) / total * 100 for n in (1, 3, 5, 10)}


def lista_campanha(db: Session, empresa_id: int | None, produto_nome=None, perfil=None, estado=None, curva_abc=None) -> list:
    query = db.query(Cliente)
    if empresa_id is not None:
        query = query.filter(Cliente.empresa_id == empresa_id)
    if perfil and perfil != "todos":
        query = query.filter(Cliente.perfil_publico == perfil)
    if estado:
        query = query.filter(Cliente.endereco_estado == estado)
    if curva_abc:
        query = query.filter(Cliente.curva_abc == curva_abc)
    return [_cliente_base(c) | {"nome": c.nome, "perfil": c.perfil_publico, "telefone": c.telefone_celular or c.telefone, "produto_top": produto_nome, "valor_total": float(c.valor_total_comprado or 0)} for c in query.limit(1000).all()]


def _vendas_periodo(db, empresa_id, data_inicio, data_fim):
    q = db.query(Venda).filter(Venda.data_venda >= data_inicio, Venda.data_venda <= data_fim)
    return q.filter(Venda.empresa_id == empresa_id) if empresa_id is not None else q


def _itens_periodo(db, empresa_id, data_inicio, data_fim):
    q = db.query(ItemVenda).join(Venda, Venda.id == ItemVenda.venda_id).filter(Venda.data_venda >= data_inicio, Venda.data_venda <= data_fim)
    return q.filter(ItemVenda.empresa_id == empresa_id) if empresa_id is not None else q


def _cliente_base(c: Cliente) -> dict:
    return {"cliente_id": c.id, "cliente_nome": c.nome, "perfil_publico": c.perfil_publico, "tipo_pessoa": c.tipo_pessoa, "cpf_cnpj": c.cpf_cnpj or c.cpf or c.cnpj, "email": c.email, "telefone_celular": c.telefone_celular, "whatsapp": c.whatsapp, "emails_cobranca": c.emails_cobranca, "cidade": c.endereco_cidade, "estado": c.endereco_estado, "cep": c.endereco_cep, "curva_abc": c.curva_abc, "qtde_comprada": 0.0, "valor_total": 0.0, "ultima_compra": None, "vendedor_nome": None}


def _pct(num: Decimal, den: Decimal) -> float:
    return float((num / den * Decimal("100")) if den else Decimal("0"))


def _curva(ratio: Decimal) -> str:
    return "A" if ratio <= Decimal("0.80") else "B" if ratio <= Decimal("0.95") else "C"
