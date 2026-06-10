import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { evolucaoRecebimentos, formasPagamento } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#94A3B8'];
const titulos = [
  { cliente: 'Cliente A', vencimento: '2026-06-18', valor: 86000, status: 'A vencer', forma: 'Pix', dias: -8 },
  { cliente: 'Cliente B', vencimento: '2026-05-21', valor: 42000, status: 'Vencido', forma: 'Boleto', dias: 20 },
  { cliente: 'Cliente C', vencimento: '2026-03-01', valor: 29000, status: 'Vencido', forma: 'Transferencia', dias: 101 },
  { cliente: 'Cliente D', vencimento: '2026-06-01', valor: 65000, status: 'Pago', forma: 'Cartao de Credito', dias: 0 },
];

export default function ContasReceber() {
  const [sortKey, setSortKey] = useState<'cliente' | 'valor' | 'vencimento'>('valor');
  const sorted = useMemo(() => [...titulos].sort((a, b) => (a[sortKey] > b[sortKey] ? -1 : 1)), [sortKey]);
  const total = titulos.reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="page">
      <header><h1>Contas a Receber</h1><p>KPIs executivos, formas de recebimento e risco de inadimplencia.</p></header>
      <div className="metrics six">
        <MetricCard title="Total em Aberto" value={formatCurrency(385000)} />
        <MetricCard title="A Vencer" value={formatCurrency(206000)} tone="green" />
        <MetricCard title="Vencido ate 30 dias" value={formatCurrency(75000)} tone="amber" />
        <MetricCard title="Vencido 31-90 dias" value={formatCurrency(75000)} tone="orange" />
        <MetricCard title="Vencido 90+ dias" value={formatCurrency(29000)} tone="red" />
        <MetricCard title="PMR" value="37 dias" tone="slate" />
      </div>
      <div className="grid two">
        <ChartCard title="Forma de Recebimento">
          <ResponsiveContainer height={280}>
            <PieChart>
              <Pie data={formasPagamento} dataKey="valor_recebido" nameKey="forma" innerRadius={58} outerRadius={96}>
                {formasPagamento.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-list">{formasPagamento.map((item) => <span key={item.forma}>{item.forma}: {formatCurrency(item.valor_recebido)} ({formatPct(item.participacao_pct)})</span>)}</div>
        </ChartCard>
        <ChartCard title="Evolucao de Recebimentos">
          <ResponsiveContainer height={320}>
            <BarChart data={evolucaoRecebimentos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(v) => typeof v === 'number' ? formatCurrency(v) : v} />
              <Legend />
              <Bar yAxisId="left" dataKey="faturado" fill="#1d4ed8" />
              <Bar yAxisId="left" dataKey="recebido" fill="#10b981" />
              <Line yAxisId="right" dataKey="taxa" stroke="#ef4444" strokeWidth={3} />
            </BarChart>
          </ResponsiveContainer>
          <p className="alert">Abril abaixo de 85% exige acao de cobranca.</p>
        </ChartCard>
      </div>
      <section className="panel"><h2>Titulos</h2>
        <table><thead><tr>{['cliente','vencimento','valor'].map((key) => <th key={key} onClick={() => setSortKey(key as typeof sortKey)}>{key}</th>)}<th>Status</th><th>Forma Pagamento</th><th>Risco</th></tr></thead>
          <tbody>{sorted.map((item) => <tr key={item.cliente}><td>{item.cliente}</td><td>{item.vencimento}</td><td>{formatCurrency(item.valor)}</td><td>{item.status}</td><td>{item.forma}</td><td>{item.dias > 90 ? <span className="badge red">Critico</span> : <span className="badge">Normal</span>}</td></tr>)}</tbody>
          <tfoot><tr><td>Total</td><td /><td>{formatCurrency(total)}</td><td colSpan={3} /></tr></tfoot>
        </table>
      </section>
    </div>
  );
}
