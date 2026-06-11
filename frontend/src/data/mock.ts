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
  { fator: 'Sazonalidade histórica', tendencia: 'positiva', impacto_pct: 8, descricao: 'Julho/Ago tipicamente acima da média' },
  { fator: 'Inadimplência elevada', tendencia: 'negativa', impacto_pct: -15, descricao: 'CAR 90+ impacta fluxo real' },
  { fator: 'Pipeline comercial', tendencia: 'positiva', impacto_pct: 5, descricao: 'Propostas em negociação' },
  { fator: 'Base de clientes', tendencia: 'neutra', impacto_pct: 0, descricao: 'Sem churn significativo' },
];

export const mockEstados = [
  { uf: 'SP', nome_estado: 'São Paulo', estado: 'São Paulo', receita: 318000, qtde_vendas: 47, pedidos: 47, ticket_medio: 6766, margem_pct: 22.4, participacao_pct: 37.0, crescimento_mom: 8.2 },
  { uf: 'RJ', nome_estado: 'Rio de Janeiro', estado: 'Rio de Janeiro', receita: 144000, qtde_vendas: 19, pedidos: 19, ticket_medio: 7579, margem_pct: 20.8, participacao_pct: 16.7, crescimento_mom: 4.5 },
  { uf: 'MG', nome_estado: 'Minas Gerais', estado: 'Minas Gerais', receita: 126000, qtde_vendas: 16, pedidos: 16, ticket_medio: 7875, margem_pct: 21.1, participacao_pct: 14.6, crescimento_mom: 2.1 },
  { uf: 'PR', nome_estado: 'Paraná', estado: 'Paraná', receita: 95000, qtde_vendas: 12, pedidos: 12, ticket_medio: 7917, margem_pct: 19.6, participacao_pct: 11.0, crescimento_mom: 6.3 },
  { uf: 'RS', nome_estado: 'Rio Grande do Sul', estado: 'Rio Grande do Sul', receita: 87000, qtde_vendas: 11, pedidos: 11, ticket_medio: 7909, margem_pct: 18.9, participacao_pct: 10.1, crescimento_mom: -1.4 },
  { uf: 'BA', nome_estado: 'Bahia', estado: 'Bahia', receita: 69000, qtde_vendas: 8, pedidos: 8, ticket_medio: 8625, margem_pct: 23.2, participacao_pct: 8.0, crescimento_mom: 3.8 },
];

export const mockCidadesPorEstado: Record<string, Array<{ cidade: string; qtde_vendas: number; receita: number; ticket_medio: number; participacao_pct: number }>> = {
  SP: [
    { cidade: 'São Paulo', qtde_vendas: 32, receita: 224000, ticket_medio: 7000, participacao_pct: 70.4 },
    { cidade: 'Campinas', qtde_vendas: 9, receita: 63000, ticket_medio: 7000, participacao_pct: 19.8 },
    { cidade: 'Ribeirão Preto', qtde_vendas: 4, receita: 28000, ticket_medio: 7000, participacao_pct: 8.8 },
    { cidade: 'Santos', qtde_vendas: 2, receita: 3000, ticket_medio: 1500, participacao_pct: 1.0 },
  ],
  RJ: [
    { cidade: 'Rio de Janeiro', qtde_vendas: 14, receita: 105000, ticket_medio: 7500, participacao_pct: 72.9 },
    { cidade: 'Niterói', qtde_vendas: 3, receita: 24000, ticket_medio: 8000, participacao_pct: 16.7 },
    { cidade: 'Duque de Caxias', qtde_vendas: 2, receita: 15000, ticket_medio: 7500, participacao_pct: 10.4 },
  ],
  MG: [
    { cidade: 'Belo Horizonte', qtde_vendas: 10, receita: 82000, ticket_medio: 8200, participacao_pct: 65.1 },
    { cidade: 'Uberlândia', qtde_vendas: 4, receita: 28000, ticket_medio: 7000, participacao_pct: 22.2 },
    { cidade: 'Contagem', qtde_vendas: 2, receita: 16000, ticket_medio: 8000, participacao_pct: 12.7 },
  ],
  PR: [
    { cidade: 'Curitiba', qtde_vendas: 9, receita: 72000, ticket_medio: 8000, participacao_pct: 75.8 },
    { cidade: 'Londrina', qtde_vendas: 3, receita: 23000, ticket_medio: 7667, participacao_pct: 24.2 },
  ],
  RS: [
    { cidade: 'Porto Alegre', qtde_vendas: 8, receita: 61000, ticket_medio: 7625, participacao_pct: 70.1 },
    { cidade: 'Caxias do Sul', qtde_vendas: 3, receita: 26000, ticket_medio: 8667, participacao_pct: 29.9 },
  ],
  BA: [
    { cidade: 'Salvador', qtde_vendas: 6, receita: 48000, ticket_medio: 8000, participacao_pct: 69.6 },
    { cidade: 'Feira de Santana', qtde_vendas: 2, receita: 21000, ticket_medio: 10500, participacao_pct: 30.4 },
  ],
};

export const vendasPorEstado: Array<{ uf: string; estado: string; receita: number; pedidos: number; cidades: Array<{ nome: string; valor: number }> }> = mockEstados.map((estado) => ({
  uf: estado.uf,
  estado: estado.nome_estado,
  receita: estado.receita,
  pedidos: estado.qtde_vendas,
  cidades: (mockCidadesPorEstado[estado.uf] || []).map((cidade) => ({ nome: cidade.cidade, valor: cidade.receita })),
}));

export const mockClientesPorCidade: Record<string, Array<{ cliente_nome: string; perfil: 'B2B' | 'B2C'; receita: number; top_produto: string; email: string; whatsapp: string }>> = {
  'São Paulo': [
    { cliente_nome: 'Sec. Segurança SP', perfil: 'B2B', receita: 375000, top_produto: 'Pistola Sig Sauer P320', email: 'compras@ssp.sp.gov.br', whatsapp: '5511933114000' },
    { cliente_nome: 'Grupo Orion Industrial', perfil: 'B2B', receita: 198000, top_produto: 'Pistola Sig Sauer P226', email: 'compras@gruporion.com.br', whatsapp: '5511999990001' },
    { cliente_nome: 'Carlos Silva', perfil: 'B2C', receita: 15000, top_produto: 'Holster Kydex P320', email: 'carlos.silva@email.com', whatsapp: '5511987654321' },
  ],
  Campinas: [
    { cliente_nome: 'Ind. Segurança Campinas', perfil: 'B2B', receita: 63000, top_produto: 'Colete Tático Modular', email: 'compras@indcamp.com.br', whatsapp: '5519988881234' },
  ],
  'Rio de Janeiro': [
    { cliente_nome: 'PM Rio de Janeiro', perfil: 'B2B', receita: 225000, top_produto: 'Pistola Sig Sauer P226', email: 'logistica@pmerj.rj.gov.br', whatsapp: '5521923345678' },
    { cliente_nome: 'João Pereira', perfil: 'B2C', receita: 19000, top_produto: 'Munição .40 S&W', email: 'joao.pereira@email.com', whatsapp: '5521987651234' },
  ],
  'Belo Horizonte': [
    { cliente_nome: 'CBA Soluções BH', perfil: 'B2B', receita: 82000, top_produto: 'Pistola Sig Sauer P320', email: 'compras@cbabh.com.br', whatsapp: '5531988881234' },
  ],
  Curitiba: [
    { cliente_nome: 'Sig Sauer Operações PR', perfil: 'B2B', receita: 72000, top_produto: 'Pistola Sig Sauer P320', email: 'ops@sigpr.com.br', whatsapp: '5541988881234' },
  ],
  'Porto Alegre': [
    { cliente_nome: 'Norte Energia RS', perfil: 'B2B', receita: 61000, top_produto: 'Colete Tático Modular', email: 'compras@nors.com.br', whatsapp: '5551988881234' },
  ],
  Salvador: [
    { cliente_nome: 'Maria Andrade', perfil: 'B2C', receita: 48000, top_produto: 'Pistola Sig Sauer P226', email: 'maria.andrade@email.com', whatsapp: '5571988881234' },
  ],
};

export const mockClientesCRM = Object.entries(mockClientesPorCidade).flatMap(([cidade, clientes], cidadeIndex) => {
  const estado = Object.entries(mockCidadesPorEstado).find(([, cidades]) => cidades.some((item) => item.cidade === cidade))?.[0] || 'SP';

  return clientes.map((cliente, clienteIndex) => ({
    id: `${estado}-${cidadeIndex}-${clienteIndex}`,
    cliente_nome: cliente.cliente_nome,
    perfil: cliente.perfil,
    cidade,
    estado,
    valor: cliente.receita,
    curva: cliente.receita >= 100000 ? 'A' : cliente.receita >= 50000 ? 'B' : 'C',
    email: cliente.email,
    whatsapp: cliente.whatsapp,
    telefone: `+${cliente.whatsapp}`,
    produto_top: cliente.top_produto,
  }));
});

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
