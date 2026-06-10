from datetime import date, timedelta
from decimal import Decimal

from analytics.forecast import calcular_cenarios_forecast
from analytics.kpi_car import calcular_aging_por_faixas
from analytics.kpi_financeiro import calcular_margem_por_valores
from connectors.conta_azul.sync_financeiro import calcular_faixa_aging, is_mutuo


def test_calcular_aging_faixas():
    hoje = date.today()

    assert calcular_faixa_aging("ABERTO", hoje + timedelta(days=1), None) == "corrente"
    assert calcular_faixa_aging("ABERTO", hoje - timedelta(days=10), None) == "1-30"
    assert calcular_faixa_aging("ABERTO", hoje - timedelta(days=45), None) == "31-60"
    assert calcular_faixa_aging("ABERTO", hoje - timedelta(days=75), None) == "61-90"
    assert calcular_faixa_aging("ABERTO", hoje - timedelta(days=120), None) == "90+"
    assert calcular_faixa_aging("PAGO", hoje - timedelta(days=120), hoje) == "pago"

    resultado = calcular_aging_por_faixas(
        {
            "corrente": Decimal("100"),
            "1-30": Decimal("50"),
            "31-60": Decimal("25"),
            "61-90": Decimal("15"),
            "90+": Decimal("10"),
        }
    )

    assert resultado["total_em_aberto"] == 200.0
    assert resultado["distribuicao"]["corrente"]["percentual"] == 50.0
    assert resultado["taxa_inadimplencia"] == 50.0


def test_margem_bruta():
    resultado = calcular_margem_por_valores(Decimal("1000"), Decimal("650"))

    assert resultado["margem_bruta_percentual"] == 35.0


def test_forecast_cenarios():
    resultado = calcular_cenarios_forecast(Decimal("1000"))

    assert resultado["base"] == 1000.0
    assert resultado["otimista"] == 1150.0
    assert resultado["pessimista"] == 850.0


def test_excluir_mutuo_car():
    assert is_mutuo("Mutuo entre empresas do grupo")
    assert is_mutuo("Mútuo operacional interno")
    assert not is_mutuo("Venda faturada para cliente externo")
