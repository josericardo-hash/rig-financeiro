import { Fragment, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { b2bB2cMensal } from '../data/mock';
import { formatCurrency } from '../services/api';

const mockVendasRecentes = [
  { id: 'V001', numero: 7482, data: '2026-06-01', cliente: 'Sec. Seguranca SP', empresa: 'Performa Extreme', valor: 375000, margem: 20.0, status: 'Faturado', vendedor: 'Consultor 1' },
  { id: 'V002', numero: 7391, data: '2026-05-28', cliente: 'PM Rio de Janeiro', empresa: 'Performa Extreme', valor: 225000, margem: 20.0, status: 'Faturado', vendedor: 'Consultor 1' },
  { id: 'V003', numero: 7405, data: '2026-05-15', cliente: 'Carlos Silva', empresa: 'SIG do Brasil', valor: 15000, margem: 22.5, status: 'Faturado', vendedor: 'Consultor 2' },
  { id: 'V004', numero: 7512, data: '2026-06-05', cliente: 'Norte Energia', empresa: 'CBA Armas', valor: 48000, margem: 18.3, status: 'Aprovado', vendedor: 'Consultor 3' },
  { id: 'V005', numero: 7498, data: '2026-06-03', cliente: 'Grupo Orion', empresa: 'Performa Extreme', valor: 198000, margem: 21.1, status: 'Faturado', vendedor: 'Consultor 1' },
];

const mockItensVenda: Record<string, Array<{ produto: string; tipo: string; qtde: number; valor_unit: number; valor_total: number; margem_pct: number }>> = {
  V001: [
    { produto: 'Pistola Sig Sauer P320', tipo: 'PRODUTO', qtde: 50, valor_unit: 7500, valor_total: 375000, margem_pct: 20.0 },
  ],
  V002: [
    { produto: 'Pistola Sig Sauer P226', tipo: 'PRODUTO', qtde: 30, valor_unit: 7500, valor_total: 225000, margem_pct: 20.0 },
  ],
  V003: [
    { produto: 'Holster Kydex P320', tipo: 'PRODUTO', qtde: 5, valor_unit: 500, valor_total: 2500, margem_pct: 40.0 },
    { produto: 'Kit Limpeza', tipo: 'PRODUTO', qtde: 10, valor_unit: 100, valor_total: 1000, margem_pct: 40.0 },
  ],
  V004: [
    { produto: 'Projeto RIG Gerencial', tipo: 'SERVICO', qtde: 1, valor_unit: 48000, valor_total: 48000, margem_pct: 18.3 },
  ],
  V005: [
    { produto: 'Licenca Dashboard COO', tipo: 'SOFTWARE', qtde: 6, valor_unit: 33000, valor_total: 198000, margem_pct: 21.1 },
  ],
};

const totalReceita = mockVendasRecentes.reduce((sum, venda) => sum + venda.valor, 0);
const ticketMedio = totalReceita / mockVendasRecentes.length;
const margemMedia = mockVendasRecentes.reduce((sum, venda) => sum + venda.margem, 0) / mockVendasRecentes.length;

export default function Vendas() {
  const [aberta, setAberta] = useState('V001');

  return (
    <div className="page">
      <header><h1>Vendas</h1><p>Pedidos com drill-down de itens e ranking comercial.</p></header>
      <div className="metrics four">
        <MetricCard title="Receita Total" value={formatCurrency(totalReceita)} />
        <MetricCard title="Qtde Pedidos" value={String(mockVendasRecentes.length)} />
        <MetricCard title="Ticket Médio" value={formatCurrency(ticketMedio)} />
        <MetricCard title="Margem" value={`${margemMedia.toFixed(1)}%`} tone="green" />
      </div>

      <ChartCard title="Evolução por Empresa">
        <ResponsiveContainer height={300}>
          <BarChart data={b2bB2cMensal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="b2b" fill="#1d4ed8" />
            <Bar dataKey="b2c" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <section className="panel">
        <h2>Vendas recentes</h2>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Empresa</th>
              <th>Valor</th>
              <th>Margem%</th>
              <th>Status</th>
              <th>▶</th>
            </tr>
          </thead>
          <tbody>
            {mockVendasRecentes.map((venda) => (
              <Fragment key={venda.id}>
                <tr onClick={() => setAberta(aberta === venda.id ? '' : venda.id)}>
                  <td>{venda.numero}</td>
                  <td>{venda.data}</td>
                  <td>{venda.cliente}</td>
                  <td>{venda.empresa}</td>
                  <td>{formatCurrency(venda.valor)}</td>
                  <td>{venda.margem.toFixed(1)}%</td>
                  <td>{venda.status}</td>
                  <td>{aberta === venda.id ? '▼' : '▶'}</td>
                </tr>
                {aberta === venda.id && (
                  <tr>
                    <td colSpan={8}>
                      <table className="inner">
                        <thead>
                          <tr><th>Produto</th><th>Tipo</th><th>Qtde</th><th>Valor unit.</th><th>Valor total</th><th>Margem%</th></tr>
                        </thead>
                        <tbody>
                          {(mockItensVenda[venda.id] ?? []).map((item) => (
                            <tr key={`${venda.id}-${item.produto}`}>
                              <td>{item.produto}</td>
                              <td>{item.tipo}</td>
                              <td>{item.qtde}</td>
                              <td>{formatCurrency(item.valor_unit)}</td>
                              <td>{formatCurrency(item.valor_total)}</td>
                              <td>{item.margem_pct.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Ranking de Vendedores</h2>
        {['Consultor 1', 'Consultor 2', 'Consultor 3'].map((nome, i) => (
          <div className="progress-row" key={nome}>
            <span>{nome}</span>
            <strong>{formatCurrency([798000, 15000, 48000][i])}</strong>
            <div><i style={{ width: `${[96, 42, 57][i]}%` }} /></div>
            <span>{[96, 42, 57][i]}% da meta</span>
          </div>
        ))}
      </section>
    </div>
  );
}
