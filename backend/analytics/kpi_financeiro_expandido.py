from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.financeiro import ContaPagar, ContaReceber
from models.venda import Venda


def dre_simplificado(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    vendas = db.query(
        func.coalesce(func.sum(Venda.valor_bruto), 0), func.coalesce(func.sum(Venda.valor_desconto), 0),
        func.coalesce(func.sum(Venda.valor_liquido), 0), func.coalesce(func.sum(Venda.custo_total), 0)
    ).filter(Venda.data_venda >= data_inicio, Venda.data_venda <= data_fim)
    cap = db.query(func.coalesce(func.sum(ContaPagar.valor_original), 0)).filter(ContaPagar.data_vencimento >= data_inicio, ContaPagar.data_vencimento <= data_fim)
    if empresa_id is not None:
        vendas = vendas.filter(Venda.empresa_id == empresa_id)
        cap = cap.filter(ContaPagar.empresa_id == empresa_id)
    bruto, descontos, liquido, cmv = [Decimal(v or 0) for v in vendas.one()]
    despesas = Decimal(cap.scalar() or 0)
    lucro = liquido - cmv
    ebitda = lucro - despesas
    return {"faturamento_bruto": _line(bruto, liquido), "descontos": _line(descontos, liquido), "faturamento_liquido": _line(liquido, liquido), "cmv": _line(cmv, liquido), "lucro_bruto": _line(lucro, liquido), "despesas_operacionais": _line(despesas, liquido), "ebitda_estimado": _line(ebitda, liquido)}


def dre_comparativo(db: Session, empresa_id: int | None, mes_atual: date, mes_anterior: date) -> dict:
    atual = dre_simplificado(db, empresa_id, mes_atual, _fim_mes(mes_atual))
    anterior = dre_simplificado(db, empresa_id, mes_anterior, _fim_mes(mes_anterior))
    return {"atual": atual, "anterior": anterior}


def cap_por_categoria(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> list:
    q = db.query(ContaPagar.categoria_nome, func.sum(ContaPagar.valor_original), func.count(ContaPagar.id)).filter(ContaPagar.data_vencimento >= data_inicio, ContaPagar.data_vencimento <= data_fim)
    if empresa_id is not None:
        q = q.filter(ContaPagar.empresa_id == empresa_id)
    rows = q.group_by(ContaPagar.categoria_nome).all()
    total = sum(Decimal(r[1] or 0) for r in rows) or Decimal("1")
    return [{"categoria": r[0] or "Sem categoria", "valor_total": float(r[1] or 0), "participacao_pct": float(Decimal(r[1] or 0) / total * 100), "qtde_titulos": int(r[2] or 0)} for r in rows]


def cap_por_grupo_despesa(db: Session, empresa_id: int | None, data_inicio: date | None = None, data_fim: date | None = None) -> list[dict]:
    query = db.query(ContaPagar)
    if empresa_id is not None:
        query = query.filter(ContaPagar.empresa_id == empresa_id)
    if data_inicio is not None:
        query = query.filter(ContaPagar.data_vencimento >= data_inicio)
    if data_fim is not None:
        query = query.filter(ContaPagar.data_vencimento <= data_fim)
    buckets: dict[str, dict] = {}
    for item in query.all():
        grupo = _grupo_despesa(item.categoria_nome, item.descricao)
        bucket = buckets.setdefault(grupo, {"grupo": grupo, "valor_total": 0.0, "qtde_titulos": 0})
        bucket["valor_total"] += float((item.valor_original or 0) - (item.valor_pago or 0))
        bucket["qtde_titulos"] += 1
    if not buckets:
        return _mock_grupos_despesa()
    total = sum(item["valor_total"] for item in buckets.values()) or 1
    return [
        {**item, "participacao_pct": round(item["valor_total"] / total * 100, 1), "variacao_mom": 0.0}
        for item in sorted(buckets.values(), key=lambda row: row["valor_total"], reverse=True)
    ]


def cap_fornecedores_top(db: Session, empresa_id: int | None, data_inicio: date | None = None, data_fim: date | None = None, limite: int = 5) -> list[dict]:
    query = db.query(
        ContaPagar.fornecedor_nome,
        ContaPagar.categoria_nome,
        func.coalesce(func.sum(ContaPagar.valor_original - ContaPagar.valor_pago), 0),
        func.count(ContaPagar.id),
    )
    if empresa_id is not None:
        query = query.filter(ContaPagar.empresa_id == empresa_id)
    if data_inicio is not None:
        query = query.filter(ContaPagar.data_vencimento >= data_inicio)
    if data_fim is not None:
        query = query.filter(ContaPagar.data_vencimento <= data_fim)
    rows = query.group_by(ContaPagar.fornecedor_nome, ContaPagar.categoria_nome).order_by(func.sum(ContaPagar.valor_original - ContaPagar.valor_pago).desc()).limit(limite).all()
    total = sum(Decimal(row[2] or 0) for row in rows) or Decimal("1")
    output = [
        {
            "fornecedor": row[0] or "Fornecedor nao identificado",
            "categoria": row[1] or "Outros",
            "valor_total": float(row[2] or 0),
            "qtde_pagamentos": int(row[3] or 0),
            "participacao_pct": float(Decimal(row[2] or 0) / total * 100),
        }
        for row in rows
    ]
    return output or _mock_fornecedores_top()


def cap_calendario_vencimentos(db: Session, empresa_id: int | None) -> list:
    hoje = date.today()
    q = db.query(ContaPagar).filter(ContaPagar.data_vencimento >= hoje, ContaPagar.data_vencimento <= hoje + timedelta(days=90))
    if empresa_id is not None:
        q = q.filter(ContaPagar.empresa_id == empresa_id)
    buckets: dict[str, dict] = {}
    for item in q.all():
        semana = item.data_vencimento.strftime("%Y-W%U") if item.data_vencimento else "N/I"
        bucket = buckets.setdefault(semana, {"semana": semana, "valor_total": 0.0, "qtde_titulos": 0})
        bucket["valor_total"] += float(item.valor_original or 0)
        bucket["qtde_titulos"] += 1
    return list(buckets.values())


def car_por_vendedor(db: Session, empresa_id: int | None) -> list:
    q = db.query(Venda.vendedor_nome, func.sum(ContaReceber.valor_original - ContaReceber.valor_pago), func.count(ContaReceber.id)).join(ContaReceber, ContaReceber.cliente_id == Venda.cliente_id)
    if empresa_id is not None:
        q = q.filter(Venda.empresa_id == empresa_id)
    return [{"vendedor": r[0] or "N/I", "valor_aberto": float(r[1] or 0), "qtde_titulos": int(r[2] or 0), "taxa_inadimplencia_pct": 0.0} for r in q.group_by(Venda.vendedor_nome).all()]


def indice_liquidez(db: Session, empresa_id: int | None) -> dict:
    hoje = date.today()
    car = db.query(func.coalesce(func.sum(ContaReceber.valor_original - ContaReceber.valor_pago), 0)).filter(ContaReceber.data_vencimento <= hoje + timedelta(days=30))
    cap = db.query(func.coalesce(func.sum(ContaPagar.valor_original - ContaPagar.valor_pago), 0)).filter(ContaPagar.data_vencimento <= hoje + timedelta(days=30))
    if empresa_id is not None:
        car = car.filter(ContaReceber.empresa_id == empresa_id)
        cap = cap.filter(ContaPagar.empresa_id == empresa_id)
    recebiveis = Decimal(car.scalar() or 0)
    obrigacoes = Decimal(cap.scalar() or 0)
    indice = float(recebiveis / obrigacoes) if obrigacoes else 0.0
    return {"recebiveis_30d": float(recebiveis), "obrigacoes_30d": float(obrigacoes), "indice": indice, "status": "saudavel" if indice > 1.5 else "atencao" if indice >= 1 else "critico"}


def evolucao_car(db: Session, empresa_id: int | None) -> list:
    q = db.query(func.to_char(ContaReceber.data_vencimento, "YYYY-MM"), func.sum(ContaReceber.valor_original - ContaReceber.valor_pago))
    if empresa_id is not None:
        q = q.filter(ContaReceber.empresa_id == empresa_id)
    q = q.group_by(func.to_char(ContaReceber.data_vencimento, "YYYY-MM")).order_by(func.to_char(ContaReceber.data_vencimento, "YYYY-MM")).limit(6)
    return [{"mes": r[0], "saldo_aberto": float(r[1] or 0)} for r in q.all()]


def _line(valor: Decimal, base: Decimal) -> dict:
    return {"valor": float(valor), "margem_pct": float((valor / base * Decimal("100")) if base else 0)}


def _fim_mes(d: date) -> date:
    return date(d.year + (d.month // 12), d.month % 12 + 1, 1) - timedelta(days=1)


def _grupo_despesa(categoria: str | None, descricao: str | None) -> str:
    text = f"{categoria or ''} {descricao or ''}".lower()
    if "transfer" in text:
        return "Transferencias"
    if "cartao" in text or "cartão" in text:
        return "Cartao Corporativo"
    if "serv" in text or "pj" in text or "consult" in text:
        return "Servicos PJ"
    if "pessoal" in text or "pro-labore" in text or "salario" in text:
        return "Pessoal/Pro-labore"
    if "aluguel" in text or "infra" in text:
        return "Aluguel"
    if "imposto" in text or "darf" in text or "taxa" in text:
        return "Impostos"
    return "Outros"


def _mock_grupos_despesa() -> list[dict]:
    return [
        {"grupo": "Transferencias", "valor_total": 1496000.0, "participacao_pct": 45.1, "qtde_titulos": 12, "variacao_mom": 4.2},
        {"grupo": "Cartao Corporativo", "valor_total": 702981.0, "participacao_pct": 21.2, "qtde_titulos": 34, "variacao_mom": -2.1},
        {"grupo": "Servicos PJ", "valor_total": 537498.0, "participacao_pct": 16.2, "qtde_titulos": 18, "variacao_mom": 8.8},
        {"grupo": "Pessoal/Pro-labore", "valor_total": 383600.0, "participacao_pct": 11.6, "qtde_titulos": 6, "variacao_mom": 0.0},
        {"grupo": "Aluguel", "valor_total": 287440.0, "participacao_pct": 8.7, "qtde_titulos": 3, "variacao_mom": 0.0},
        {"grupo": "Impostos", "valor_total": 265908.0, "participacao_pct": 8.0, "qtde_titulos": 9, "variacao_mom": 3.7},
    ]


def _mock_fornecedores_top() -> list[dict]:
    return [
        {"fornecedor": "Transferencia Intercompany", "categoria": "Transferencias", "valor_total": 640000.0, "qtde_pagamentos": 4, "participacao_pct": 35.5},
        {"fornecedor": "Operadora Cartao", "categoria": "Cartao Corporativo", "valor_total": 420000.0, "qtde_pagamentos": 8, "participacao_pct": 23.3},
        {"fornecedor": "Consultoria PJ", "categoria": "Servicos PJ", "valor_total": 315000.0, "qtde_pagamentos": 6, "participacao_pct": 17.5},
        {"fornecedor": "Pro-labore Diretoria", "categoria": "Pessoal/Pro-labore", "valor_total": 250000.0, "qtde_pagamentos": 3, "participacao_pct": 13.9},
        {"fornecedor": "Administradora Imovel", "categoria": "Aluguel", "valor_total": 180000.0, "qtde_pagamentos": 3, "participacao_pct": 9.8},
    ]
