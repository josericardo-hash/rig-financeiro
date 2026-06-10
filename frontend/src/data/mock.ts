export const formasPagamento = [
  { forma: 'Pix', valor_recebido: 125000, qtde: 45, participacao_pct: 51.4 },
  { forma: 'Boleto', valor_recebido: 67000, qtde: 23, participacao_pct: 27.5 },
  { forma: 'Cartao de Credito', valor_recebido: 32000, qtde: 12, participacao_pct: 13.1 },
  { forma: 'Transferencia', valor_recebido: 15000, qtde: 8, participacao_pct: 6.2 },
  { forma: 'Outros', valor_recebido: 4467, qtde: 3, participacao_pct: 1.8 },
];

export const evolucaoRecebimentos = [
  { mes: 'Jan', faturado: 180000, recebido: 195000, taxa: 108.3 },
  { mes: 'Fev', faturado: 223031, recebido: 243219, taxa: 109.1 },
  { mes: 'Mar', faturado: 195000, recebido: 178000, taxa: 91.3 },
  { mes: 'Abr', faturado: 210000, recebido: 168000, taxa: 80.0 },
  { mes: 'Mai', faturado: 235000, recebido: 212000, taxa: 90.2 },
  { mes: 'Jun', faturado: 198000, recebido: 175000, taxa: 88.4 },
];

export const gruposDespesa = [
  { grupo: 'Transferencias', valor: 1496000, participacao_pct: 45.1, qtde: 12 },
  { grupo: 'Cartao Corporativo', valor: 702981, participacao_pct: 21.2, qtde: 34 },
  { grupo: 'Servicos PJ', valor: 537498, participacao_pct: 16.2, qtde: 18 },
  { grupo: 'Pessoal/Pro-labore', valor: 383600, participacao_pct: 11.6, qtde: 6 },
  { grupo: 'Aluguel', valor: 287440, participacao_pct: 8.7, qtde: 3 },
  { grupo: 'Impostos', valor: 265908, participacao_pct: 8.0, qtde: 9 },
];

export const fluxoCompleto = {
  saldo_inicial: 450000,
  entradas_realizadas: 243219,
  saidas_realizadas: 185300,
  saldo_final_realizado: 507919,
  entradas_previstas: 125000,
  saidas_previstas: 98500,
  saldo_projetado: 534419,
  variacao_pct: 5.2,
};

export const fluxoSemanal = [
  { semana: 'S1 Jun', entradas_real: 68000, saidas_real: 42000, entradas_prev: 45000, saidas_prev: 38000, saldo_acum: 476000, saldo_proj: 483000 },
  { semana: 'S2 Jun', entradas_real: 82000, saidas_real: 55000, entradas_prev: 35000, saidas_prev: 28000, saldo_acum: 503000, saldo_proj: 510000 },
  { semana: 'S3 Jun', entradas_real: 58000, saidas_real: 48000, entradas_prev: 30000, saidas_prev: 22000, saldo_acum: 513000, saldo_proj: 521000 },
  { semana: 'S4 Jun', entradas_real: 35219, saidas_real: 40300, entradas_prev: 15000, saidas_prev: 10500, saldo_acum: 507919, saldo_proj: 534419 },
];

export const saldosContas = [
  { nome: 'Conta Corrente Bradesco', tipo: 'Corrente', saldo: 324000 },
  { nome: 'Conta Corrente Itau', tipo: 'Corrente', saldo: 138000 },
  { nome: 'Poupanca Seguranca', tipo: 'Poupanca', saldo: 45919 },
];

export const b2bB2cMensal = [
  { mes: 'Jan', b2b: 144000, b2c: 36000 },
  { mes: 'Fev', b2b: 178424, b2c: 44607 },
  { mes: 'Mar', b2b: 156000, b2c: 39000 },
  { mes: 'Abr', b2b: 168000, b2c: 42000 },
  { mes: 'Mai', b2b: 188000, b2c: 47000 },
  { mes: 'Jun', b2b: 158400, b2c: 39600 },
];

export const forecastHistorico = [
  { mes: 'Jan/2026', realizado: 180000, meta: 200000, ating_pct: 90.0 },
  { mes: 'Fev/2026', realizado: 223031, meta: 200000, ating_pct: 111.5 },
  { mes: 'Mar/2026', realizado: 195000, meta: 210000, ating_pct: 92.9 },
  { mes: 'Abr/2026', realizado: 210000, meta: 210000, ating_pct: 100.0 },
  { mes: 'Mai/2026', realizado: 235000, meta: 220000, ating_pct: 106.8 },
  { mes: 'Jun/2026', realizado: 198000, meta: 220000, ating_pct: 90.0 },
];

export const forecastProjecao = [
  { mes: 'Jul/2026', pessimista: 168300, base: 198000, otimista: 227700, confianca: 75 },
  { mes: 'Ago/2026', pessimista: 172200, base: 202600, otimista: 233000, confianca: 65 },
  { mes: 'Set/2026', pessimista: 176000, base: 207000, otimista: 238000, confianca: 55 },
];

export const fatoresForecast = [
  { fator: 'Sazonalidade historica', tendencia: 'positiva', impacto_pct: 8, descricao: 'Julho/Ago tipicamente acima da media' },
  { fator: 'Inadimplencia elevada', tendencia: 'negativa', impacto_pct: -15, descricao: 'CAR 90+ impacta fluxo real' },
  { fator: 'Pipeline comercial', tendencia: 'positiva', impacto_pct: 5, descricao: 'Propostas em negociacao' },
  { fator: 'Base de clientes', tendencia: 'neutra', impacto_pct: 0, descricao: 'Sem churn significativo' },
];

export const vendasPorEstado = [
  { uf: 'SP', estado: 'Sao Paulo', receita: 318000, pedidos: 47, cidades: [{ nome: 'Sao Paulo', valor: 180000 }, { nome: 'Campinas', valor: 82000 }] },
  { uf: 'RJ', estado: 'Rio de Janeiro', receita: 144000, pedidos: 19, cidades: [{ nome: 'Rio de Janeiro', valor: 98000 }, { nome: 'Niteroi', valor: 46000 }] },
  { uf: 'MG', estado: 'Minas Gerais', receita: 126000, pedidos: 16, cidades: [{ nome: 'Belo Horizonte', valor: 89000 }, { nome: 'Uberlandia', valor: 37000 }] },
  { uf: 'PR', estado: 'Parana', receita: 95000, pedidos: 12, cidades: [{ nome: 'Curitiba', valor: 65000 }] },
  { uf: 'RS', estado: 'Rio Grande do Sul', receita: 87000, pedidos: 11, cidades: [{ nome: 'Porto Alegre', valor: 55000 }] },
  { uf: 'BA', estado: 'Bahia', receita: 69000, pedidos: 8, cidades: [{ nome: 'Salvador', valor: 49000 }] },
];

export const pedidos = [
  { id: 'venda-001', numero: '001248', data: '2026-06-04', cliente: 'Policia Civil SP', empresa: 'Performa', valor: 40000, margem: 21.3, status: 'Faturado' },
  { id: 'venda-002', numero: '001249', data: '2026-06-06', cliente: 'Clube Tatico RJ', empresa: 'SIG', valor: 18500, margem: 18.8, status: 'Pago' },
  { id: 'venda-003', numero: '001250', data: '2026-06-08', cliente: 'Cliente B2B MG', empresa: 'CBA', valor: 58000, margem: 24.1, status: 'Em aberto' },
];

export const itensVenda: Record<string, Array<{ produto: string; tipo: string; qtde: number; valor_unit: number; valor_total: number; custo_unit: number; margem_pct: number }>> = {
  'venda-001': [
    { produto: 'Pistola Sig Sauer P320', tipo: 'PRODUTO', qtde: 5, valor_unit: 7500, valor_total: 37500, custo_unit: 6000, margem_pct: 20.0 },
    { produto: 'Holster Kydex P320', tipo: 'PRODUTO', qtde: 5, valor_unit: 500, valor_total: 2500, custo_unit: 300, margem_pct: 40.0 },
  ],
  'venda-002': [
    { produto: 'Treinamento operacional', tipo: 'SERVICO', qtde: 1, valor_unit: 18500, valor_total: 18500, custo_unit: 13000, margem_pct: 29.7 },
  ],
  'venda-003': [
    { produto: 'Kit Optico Romeo', tipo: 'PRODUTO', qtde: 10, valor_unit: 5800, valor_total: 58000, custo_unit: 4400, margem_pct: 24.1 },
  ],
};
