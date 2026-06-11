import { Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { evolucaoRecebimentos, fluxoCompleto, forecastHistorico, mockEstados, pedidos } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

export default function Dashboard() {
  const receita = mockEstados.reduce((sum, estado) => sum + estado.receita, 0);
  const pedidosTotal = mockEstados.reduce((sum, estado) => sum + estado.qtde_vendas, 0);
  const ticketMedio = receita / pedidosTotal;
  const margemMedia = mockEstados.reduce((sum, estado) => sum + estado.margem_pct, 0) / mockEstados.length;
  const ultimosMeses = forecastHistorico.slice(-4).map((item) => ({
    mes: item.mes.replace('/2026', ''),
    realizado: item.realizado,
    meta: item.meta,
  }));

  return (
    <div className="page">
      <header>
        <div>
          <h1>Dashboard Executivo</h1>
          <p>Visao consolidada de receita, caixa, inadimplencia, forecast e vendas recentes.</p>
        </div>
      </header>
      <div className="metrics six">
        <MetricCard title="Receita" value={formatCurrency(receita)} detail="+8,2% vs mes anterior" />
        <MetricCard title="Pedidos" value={String(pedidosTotal)} detail="6 estados com venda" tone="slate" />
        <MetricCard title="Ticket Medio" value={formatCurrency(ticketMedio)} tone="green" />
        <MetricCard title="Margem Media" value={formatPct(margemMedia)} tone="green" />
        <MetricCard title="Saldo Projetado" value={formatCurrency(fluxoCompleto.saldo_projetado)} tone="blue" />
        <MetricCard title="Risco CAR" value={formatCurrency(104000)} detail="Vencido 31+ dias" tone="red" />
      </div>
      <div className="grid two">
        <ChartCard title="Receita vs Meta">
          <ResponsiveContainer height={320}>
            <BarChart data={ultimosMeses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(v) => `${Number(v) / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="realizado" fill="#2563eb" />
              <Bar dataKey="meta" fill="#94a3b8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Recebimento Mensal">
          <ResponsiveContainer height={320}>
            <BarChart data={evolucaoRecebimentos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(v) => `${Number(v) / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="faturado" fill="#0f766e" />
              <Line dataKey="recebido" stroke="#f59e0b" strokeWidth={3} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid two">
        <section className="panel">
          <h2>Top Estados</h2>
          {mockEstados.map((estado) => (
            <div className="progress-row dashboard-row" key={estado.uf}>
              <span>{estado.uf}</span>
              <span>{estado.estado}</span>
              <strong>{formatCurrency(estado.receita)}</strong>
              <div><i style={{ width: `${estado.participacao_pct * 2.3}%` }} /></div>
              <span>{formatPct(estado.participacao_pct)}</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Vendas Recentes</h2>
          <table>
            <thead><tr><th>Data</th><th>Cliente</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.data}</td>
                  <td>{pedido.cliente}</td>
                  <td>{formatCurrency(pedido.valor)}</td>
                  <td><span className="badge green">{pedido.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
