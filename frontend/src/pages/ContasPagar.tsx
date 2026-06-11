import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { gruposDespesa } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#06B6D4'];
const Evolução = [
  { mes: 'Jan', previsto: 165000, realizado: 158000, variacao: -4.2 },
  { mes: 'Fev', previsto: 190000, realizado: 185300, variacao: -2.5 },
  { mes: 'Mar', previsto: 172000, realizado: 181000, variacao: 5.2 },
  { mes: 'Abr', previsto: 210000, realizado: 198000, variacao: -5.7 },
  { mes: 'Mai', previsto: 225000, realizado: 231000, variacao: 2.7 },
  { mes: 'Jun', previsto: 205000, realizado: 185300, variacao: -9.6 },
];
const fornecedores = [
  { nome: 'Transferencia Intercompany', categoria: 'Transferencias', valor: 640000, pct: 19.3 },
  { nome: 'Operadora Cartao', categoria: 'Cartao Corporativo', valor: 420000, pct: 12.7 },
  { nome: 'Consultoria PJ', categoria: 'Servicos PJ', valor: 315000, pct: 9.5 },
  { nome: 'Pro-labore Diretoria', categoria: 'Pessoal/Pro-labore', valor: 250000, pct: 7.5 },
  { nome: 'Administradora Imovel', categoria: 'Aluguel', valor: 180000, pct: 5.4 },
];
const titulos = [
  { fornecedor: 'Transferencia Intercompany', grupo: 'Transferencias', vencimento: '2026-06-10', valor: 210000, recorrente: true },
  { fornecedor: 'Operadora Cartao', grupo: 'Cartao Corporativo', vencimento: '2026-06-17', valor: 98000, recorrente: true },
  { fornecedor: 'Consultoria PJ', grupo: 'Servicos PJ', vencimento: '2026-06-28', valor: 52500, recorrente: true },
  { fornecedor: 'DARF', grupo: 'Impostos', vencimento: '2026-06-30', valor: 38000, recorrente: false },
];

export default function ContasPagar() {
  const [grupo, setGrupo] = useState('Todos');
  const filtrados = grupo === 'Todos' ? titulos : titulos.filter((item) => item.grupo === grupo);

  return (
    <div className="page">
      <header><h1>Contas a Pagar</h1><p>Estrutura de despesas, fornecedores relevantes e recorrencias.</p></header>
      <div className="metrics five">
        <MetricCard title="Total em Aberto" value={formatCurrency(3313427)} />
        <MetricCard title="Vence Hoje" value={formatCurrency(210000)} tone="red" />
        <MetricCard title="Vence em 7 dias" value={formatCurrency(308000)} tone="amber" />
        <MetricCard title="Vence em 30 dias" value={formatCurrency(820000)} tone="blue" />
        <MetricCard title="Recorrentes/mes" value={formatCurrency(195833)} tone="slate" />
      </div>
      <div className="grid two">
        <ChartCard title="Estrutura de Despesas">
          <ResponsiveContainer height={300}><PieChart><Pie data={gruposDespesa} dataKey="valor" nameKey="grupo" outerRadius={100}>{gruposDespesa.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Pie><Tooltip formatter={(v) => formatCurrency(Number(v))} /></PieChart></ResponsiveContainer>
          <div className="legend-list">{gruposDespesa.map((item) => <span key={item.grupo}>{item.grupo}: {formatCurrency(item.valor)} ({formatPct(item.participacao_pct)})</span>)}</div>
        </ChartCard>
        <ChartCard title="Evolução de Pagamentos">
          <ResponsiveContainer height={320}><BarChart data={Evolução}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis yAxisId="left" tickFormatter={(v) => `${v / 1000}k`} /><YAxis yAxisId="right" orientation="right" /><Tooltip formatter={(v) => typeof v === 'number' ? formatCurrency(v) : v} /><Legend /><Bar yAxisId="left" dataKey="previsto" fill="#94a3b8" /><Bar yAxisId="left" dataKey="realizado" fill="#ef4444" /><Line yAxisId="right" dataKey="variacao" stroke="#1d4ed8" strokeWidth={3} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
      <section className="panel"><h2>Top Fornecedores</h2>{fornecedores.map((item) => <div className="progress-row" key={item.nome}><span>{item.nome}</span><span>{item.categoria}</span><strong>{formatCurrency(item.valor)}</strong><div><i style={{ width: `${item.pct * 4}%` }} /></div><span>{formatPct(item.pct)}</span></div>)}</section>
      <section className="panel"><h2>Titulos CAP</h2><select value={grupo} onChange={(e) => setGrupo(e.target.value)}><option>Todos</option>{gruposDespesa.map((item) => <option key={item.grupo}>{item.grupo}</option>)}</select><table><thead><tr><th>Fornecedor</th><th>Grupo</th><th>Vencimento</th><th>Valor</th><th>Recorrente</th></tr></thead><tbody>{filtrados.map((item) => <tr key={item.fornecedor}><td>{item.fornecedor}</td><td>{item.grupo}</td><td>{item.vencimento}</td><td>{formatCurrency(item.valor)}</td><td>{item.recorrente ? 'Recorrente' : '-'}</td></tr>)}</tbody></table></section>
    </div>
  );
}

