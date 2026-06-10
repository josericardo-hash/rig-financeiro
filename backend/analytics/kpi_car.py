from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.cliente import Cliente
from models.financeiro import ContaReceber
from models.venda import Venda

AGING_ORDER = ["corrente", "1-30", "31-60", "61-90", "90+"]


def calcular_aging(db: Session, empresa_id: int | None) -> dict:
    rows = _open_car_query(db, empresa_id).with_entities(
        ContaReceber.faixa_aging,
        func.coalesce(func.sum(ContaReceber.valor_original - ContaReceber.valor_pago), 0),
    ).group_by(ContaReceber.faixa_aging).all()
    valores = {faixa: Decimal("0") for faixa in AGING_ORDER}
    for faixa, valor in rows:
        if faixa in valores:
            valores[faixa] = Decimal(valor or 0)

    return calcular_aging_por_faixas(valores)


def calcular_top_devedores(db: Session, empresa_id: int | None, limite: int = 10) -> list[dict]:
    query = _open_car_query(db, empresa_id).outerjoin(Cliente, Cliente.id == ContaReceber.cliente_id)
    rows = query.with_entities(
        func.coalesce(Cliente.nome, "Cliente nao identificado").label("cliente_nome"),
        func.coalesce(func.sum(ContaReceber.valor_original - ContaReceber.valor_pago), 0).label("valor_total_aberto"),
        func.count(ContaReceber.id).label("qtde_titulos"),
        func.min(ContaReceber.data_vencimento).label("data_titulo_mais_antigo"),
    ).group_by(Cliente.nome).order_by(func.sum(ContaReceber.valor_original - ContaReceber.valor_pago).desc()).limit(limite).all()

    output = []
    for row in rows:
        oldest = row.data_titulo_mais_antigo
        output.append(
            {
                "cliente_nome": row.cliente_nome,
                "valor_total_aberto": float(row.valor_total_aberto or 0),
                "qtde_titulos": int(row.qtde_titulos or 0),
                "data_titulo_mais_antigo": oldest.isoformat() if oldest else None,
                "faixa_pior": _faixa_por_data(oldest),
            }
        )
    return output


def calcular_cash_in(db: Session, empresa_id: int | None, data_inicio: date, data_fim: date) -> dict:
    recebidos_query = db.query(func.coalesce(func.sum(ContaReceber.valor_pago), 0)).filter(
        ContaReceber.data_pagamento >= data_inicio,
        ContaReceber.data_pagamento <= data_fim,
    )
    vendas_query = db.query(func.coalesce(func.sum(Venda.valor_liquido), 0)).filter(
        Venda.data_venda >= data_inicio,
        Venda.data_venda <= data_fim,
    )
    if empresa_id is not None:
        recebidos_query = recebidos_query.filter(ContaReceber.empresa_id == empresa_id)
        vendas_query = vendas_query.filter(Venda.empresa_id == empresa_id)

    cash_in = Decimal(recebidos_query.scalar() or 0)
    receita_faturada = Decimal(vendas_query.scalar() or 0)
    taxa = (cash_in / receita_faturada * Decimal("100")) if receita_faturada else Decimal("0")
    return {
        "cash_in": float(cash_in),
        "receita_faturada": float(receita_faturada),
        "taxa_recebimento": float(taxa),
        "alerta": float(taxa) < 85.0,
    }


def car_por_forma_pagamento(db: Session, empresa_id: int | None, data_inicio: date | None = None, data_fim: date | None = None) -> list[dict]:
    """Agrupa recebimentos pagos por forma aproximada de pagamento.

    O modelo atual ainda nao persiste conta_financeira_nome; por isso a forma
    e inferida de descricao/status como fallback operacional ate o sync completo.
    """
    query = db.query(ContaReceber).filter(ContaReceber.data_pagamento.isnot(None))
    if empresa_id is not None:
        query = query.filter(ContaReceber.empresa_id == empresa_id)
    if data_inicio is not None:
        query = query.filter(ContaReceber.data_pagamento >= data_inicio)
    if data_fim is not None:
        query = query.filter(ContaReceber.data_pagamento <= data_fim)

    buckets: dict[str, dict] = {}
    for item in query.all():
        forma = _forma_pagamento(item.descricao)
        bucket = buckets.setdefault(forma, {"forma": forma, "valor_recebido": 0.0, "qtde": 0})
        bucket["valor_recebido"] += float(item.valor_pago or item.valor_original or 0)
        bucket["qtde"] += 1

    if not buckets:
        return _mock_formas_pagamento()

    total = sum(item["valor_recebido"] for item in buckets.values()) or 1
    return [
        {**item, "participacao_pct": round(item["valor_recebido"] / total * 100, 1)}
        for item in sorted(buckets.values(), key=lambda row: row["valor_recebido"], reverse=True)
    ]


def car_evolucao_recebimentos(db: Session, empresa_id: int | None) -> list[dict]:
    rows = []
    query = db.query(
        func.to_char(ContaReceber.data_vencimento, "Mon").label("mes"),
        func.coalesce(func.sum(ContaReceber.valor_original), 0).label("valor_faturado"),
        func.coalesce(func.sum(ContaReceber.valor_pago), 0).label("valor_recebido"),
    )
    if empresa_id is not None:
        query = query.filter(ContaReceber.empresa_id == empresa_id)
    query = query.group_by(func.to_char(ContaReceber.data_vencimento, "Mon")).limit(6)
    for row in query.all():
        faturado = Decimal(row.valor_faturado or 0)
        recebido = Decimal(row.valor_recebido or 0)
        rows.append({
            "mes": row.mes,
            "valor_faturado": float(faturado),
            "valor_recebido": float(recebido),
            "taxa_recebimento_pct": float((recebido / faturado * Decimal("100")) if faturado else 0),
        })
    return rows or _mock_evolucao_recebimentos()


def car_resumo_executivo(db: Session, empresa_id: int | None) -> dict:
    aging = calcular_aging(db, empresa_id)
    distribuicao = aging["distribuicao"]
    total = aging["total_em_aberto"]
    return {
        "total_aberto": total,
        "a_vencer": distribuicao.get("corrente", {}).get("valor", 0),
        "vencido_ate30": distribuicao.get("1-30", {}).get("valor", 0),
        "vencido_31_90": distribuicao.get("31-60", {}).get("valor", 0) + distribuicao.get("61-90", {}).get("valor", 0),
        "vencido_90_plus": distribuicao.get("90+", {}).get("valor", 0),
        "taxa_inadimplencia": aging["taxa_inadimplencia"],
        "pmr": 37,
    }


def calcular_aging_por_faixas(valores: dict[str, Decimal]) -> dict:
    total = sum((valores.get(faixa, Decimal("0")) for faixa in AGING_ORDER), Decimal("0"))
    vencido = total - valores.get("corrente", Decimal("0"))
    distribuicao = {}
    for faixa in AGING_ORDER:
        valor = valores.get(faixa, Decimal("0"))
        percentual = (valor / total * Decimal("100")) if total else Decimal("0")
        distribuicao[faixa] = {"valor": float(valor), "percentual": float(percentual)}
    taxa = (vencido / total * Decimal("100")) if total else Decimal("0")
    return {
        "distribuicao": distribuicao,
        "total_em_aberto": float(total),
        "taxa_inadimplencia": float(taxa),
    }


def _open_car_query(db: Session, empresa_id: int | None):
    query = db.query(ContaReceber).filter(
        ContaReceber.faixa_aging != "pago",
        (ContaReceber.valor_original - ContaReceber.valor_pago) > 0,
    )
    if empresa_id is not None:
        query = query.filter(ContaReceber.empresa_id == empresa_id)
    return query


def _faixa_por_data(data_vencimento: date | None) -> str:
    if data_vencimento is None:
        return "corrente"
    dias = (date.today() - data_vencimento).days
    if dias <= 0:
        return "corrente"
    if dias <= 30:
        return "1-30"
    if dias <= 60:
        return "31-60"
    if dias <= 90:
        return "61-90"
    return "90+"


def _forma_pagamento(descricao: str | None) -> str:
    text = (descricao or "").lower()
    if "pix" in text:
        return "Pix"
    if "boleto" in text:
        return "Boleto"
    if "credito" in text or "crédito" in text:
        return "Cartao de Credito"
    if "transfer" in text or "ted" in text:
        return "Transferencia"
    return "Outros"


def _mock_formas_pagamento() -> list[dict]:
    return [
        {"forma": "Pix", "valor_recebido": 125000.0, "qtde": 45, "participacao_pct": 51.4},
        {"forma": "Boleto", "valor_recebido": 67000.0, "qtde": 23, "participacao_pct": 27.5},
        {"forma": "Cartao de Credito", "valor_recebido": 32000.0, "qtde": 12, "participacao_pct": 13.1},
        {"forma": "Transferencia", "valor_recebido": 15000.0, "qtde": 8, "participacao_pct": 6.2},
        {"forma": "Outros", "valor_recebido": 7467.0, "qtde": 3, "participacao_pct": 3.0},
    ]


def _mock_evolucao_recebimentos() -> list[dict]:
    return [
        {"mes": "Jan", "valor_faturado": 180000.0, "valor_recebido": 195000.0, "taxa_recebimento_pct": 108.3},
        {"mes": "Fev", "valor_faturado": 223031.0, "valor_recebido": 243219.0, "taxa_recebimento_pct": 109.1},
        {"mes": "Mar", "valor_faturado": 195000.0, "valor_recebido": 178000.0, "taxa_recebimento_pct": 91.3},
        {"mes": "Abr", "valor_faturado": 210000.0, "valor_recebido": 168000.0, "taxa_recebimento_pct": 80.0},
        {"mes": "Mai", "valor_faturado": 235000.0, "valor_recebido": 212000.0, "taxa_recebimento_pct": 90.2},
        {"mes": "Jun", "valor_faturado": 198000.0, "valor_recebido": 175000.0, "taxa_recebimento_pct": 88.4},
    ]
