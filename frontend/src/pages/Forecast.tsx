import { useState } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { fatoresForecast, forecastHistorico, forecastProjecao } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

const chartData = [...forecastHistorico.map((m) => ({ mes: m.mes, real: m.realizado })), ...forecastProjecao.map((m) => ({ mes: m.mes, pess: m.pessimista, base: m.base, oti: m.otimista, range: [m.pessimista, m.otimista] }))];

export default function Forecast() {
  const [metodo, setMetodo] = useState('Média Móvel');
  return (
    <div className="page">
      <header><h1>Forecast - Próximos 3 Meses</h1><p>Baseado em médias históricas + sazonalidade</p><div className="segmented">{['Média Simples','Média Móvel','Tendência Linear'].map((m) => <button className={metodo === m ? 'active' : ''} onClick={() => setMetodo(m)} key={m}>{m}</button>)}<button>Recalcular</button></div></header>
      <div className="metrics three"><MetricCard title="Pessimista" value={formatCurrency(168300)} tone="red" detail="vs mes anterior +12,5% | Confianca 75%" /><MetricCard title="Base" value={formatCurrency(198000)} detail="vs mes anterior +12,5% | Confianca 75%" /><MetricCard title="Otimista" value={formatCurrency(227700)} tone="green" detail="vs mes anterior +12,5% | Confianca 75%" /></div>
      <ChartCard title="Histórico + Projeção"><ResponsiveContainer height={360}><ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis tickFormatter={(v) => `${v / 1000}k`} /><Tooltip formatter={(v) => Array.isArray(v) ? v.map(Number).map(formatCurrency).join(' - ') : formatCurrency(Number(v))} /><Legend /><Bar dataKey="real" fill="#1e3a8a" /><Area dataKey="range" fill="#dbeafe" stroke="#dbeafe" /><Line dataKey="base" stroke="#2563eb" strokeWidth={3} /><Line dataKey="oti" stroke="#10b981" strokeDasharray="6 4" /><Line dataKey="pess" stroke="#ef4444" strokeDasharray="6 4" /></ComposedChart></ResponsiveContainer></ChartCard>
      <section className="grid four">{fatoresForecast.map((f) => <MetricCard key={f.fator} title={f.fator} value={`${f.impacto_pct > 0 ? '+' : ''}${formatPct(f.impacto_pct)}`} tone={f.impacto_pct > 0 ? 'green' : f.impacto_pct < 0 ? 'red' : 'slate'} detail={f.descricao} />)}</section>
      <section className="panel"><h2>Metas vs Projeção</h2><table><thead><tr><th>Empresa</th><th>Meta</th><th>Forecast Base</th><th>Gap</th><th>Status</th></tr></thead><tbody>{[['Performa',250000,223000],['SIG',25000,22000],['CBA',60000,58000]].map(([e, meta, base]) => <tr key={String(e)}><td>{e}</td><td>{formatCurrency(Number(meta))}</td><td>{formatCurrency(Number(base))}</td><td>{formatCurrency(Number(base)-Number(meta))}</td><td>{Number(base) >= Number(meta)*0.95 ? 'OK' : 'Abaixo'}</td></tr>)}</tbody></table></section>
      <section className="panel"><h2>Histórico Base</h2><table><tbody>{forecastHistorico.map((m) => <tr key={m.mes}><td>{m.mes}</td><td>{formatCurrency(m.realizado)}</td><td>{formatCurrency(m.meta)}</td><td><span className={m.ating_pct >= 100 ? 'badge green' : m.ating_pct >= 85 ? 'badge amber' : 'badge red'}>{formatPct(m.ating_pct)}</span></td></tr>)}</tbody></table></section>
    </div>
  );
}
