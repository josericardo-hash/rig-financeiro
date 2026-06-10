from __future__ import annotations

from collections import defaultdict
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from models.venda import Venda


def calcular_forecast(db: Session, empresa_id: int | None) -> dict:
    hoje = date.today()
    meses = _ultimos_3_meses(hoje)
    inicio = meses[0][0]
    fim = meses[-1][1]

    query = db.query(Venda).filter(Venda.data_venda >= inicio, Venda.data_venda <= fim)
    if empresa_id is not None:
        query = query.filter(Venda.empresa_id == empresa_id)

    totais: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    for venda in query.all():
        chave = f"{venda.data_venda.year:04d}-{venda.data_venda.month:02d}"
        totais[chave] += Decimal(venda.valor_liquido or 0)

    historico = [{"mes": chave, "receita_liquida": float(totais[chave])} for _, _, chave in meses]
    media_3m = sum((totais[chave] for _, _, chave in meses), Decimal("0")) / Decimal("3")
    mes_ref = _proximo_mes(hoje)
    return calcular_cenarios_forecast(media_3m) | {
        "mes_referencia": f"{mes_ref.year:04d}-{mes_ref.month:02d}",
        "historico": historico,
    }


def calcular_cenarios_forecast(media_3m: Decimal) -> dict:
    return {
        "base": float(media_3m),
        "otimista": float(media_3m * Decimal("1.15")),
        "pessimista": float(media_3m * Decimal("0.85")),
    }


def _ultimos_3_meses(referencia: date) -> list[tuple[date, date, str]]:
    ano = referencia.year
    mes = referencia.month
    meses = []
    for offset in (3, 2, 1):
        target_mes = mes - offset
        target_ano = ano
        while target_mes <= 0:
            target_mes += 12
            target_ano -= 1
        inicio = date(target_ano, target_mes, 1)
        proximo = _proximo_mes(inicio)
        fim = date.fromordinal(proximo.toordinal() - 1)
        meses.append((inicio, fim, f"{target_ano:04d}-{target_mes:02d}"))
    return meses


def _proximo_mes(referencia: date) -> date:
    if referencia.month == 12:
        return date(referencia.year + 1, 1, 1)
    return date(referencia.year, referencia.month + 1, 1)
