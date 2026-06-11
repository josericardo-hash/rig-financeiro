import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { b2bB2cMensal, vendasPorEstado } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

const produtos = [
  { nome: 'Pistola P320', receita: 220000, tipo: 'PRODUTO', curva: 'A' },
  { nome: 'Kit Optico Romeo', receita: 178000, tipo: 'PRODUTO', curva: 'A' },
  { nome: 'Treinamento', receita: 98000, tipo: 'SERVICO', curva: 'B' },
  { nome: 'Holster Kydex', receita: 72000, tipo: 'PRODUTO', curva: 'B' },
  { nome: 'Consultoria', receita: 41000, tipo: 'SERVICO', curva: 'C' },
];
const clientes = [{ nome: 'Policia Civil SP', receita: 180000, acumulado: 35 }, { nome: 'Clube Tatico RJ', receita: 120000, acumulado: 58 }, { nome: 'Cliente B2B MG', receita: 95000, acumulado: 76 }, { nome: 'Varejo Online', receita: 60000, acumulado: 88 }];
const radar = [{ metrica: 'Ticket', b2b: 90, b2c: 45 }, { metrica: 'Margem', b2b: 70, b2c: 82 }, { metrica: 'Volume', b2b: 65, b2c: 78 }, { metrica: 'Recorrencia', b2b: 84, b2c: 40 }];

export default function Comercial() {
  const [tab, setTab] = useState('geral');
  const [estadoAberto, setEstadoAberto] = useState('SP');
  return (
    <div className="page">
      <header><h1>Comercial</h1><p>Dashboards por visao geral, produtos, geografia, B2B/B2C e curva ABC.</p></header>
      <div className="tabs">{['geral','produtos','geografia','b2b','abc'].map((id) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}>{id.toUpperCase()}</button>)}</div>
      {tab === 'geral' && <><div className="metrics four"><MetricCard title="Receita" value={formatCurrency(1045031)} /><MetricCard title="Pedidos" value="128" /><MetricCard title="Ticket Médio" value={formatCurrency(8164)} /><MetricCard title="Margem" value="22,8%" tone="green" /></div><div className="grid two"><ChartCard title="Evolução Mensal"><ResponsiveContainer height={300}><BarChart data={b2bB2cMensal}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="mes" /><YAxis /><Tooltip formatter={(v) => formatCurrency(Number(v))} /><Legend /><Bar dataKey="b2b" fill="#1d4ed8" /><Bar dataKey="b2c" fill="#10b981" /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="B2B vs B2C"><ResponsiveContainer height={300}><PieChart><Pie data={[{ n: 'B2B', v: 80 }, { n: 'B2C', v: 20 }]} dataKey="v" nameKey="n" outerRadius={100}><Cell fill="#1d4ed8" /><Cell fill="#10b981" /></Pie><Tooltip /></PieChart></ResponsiveContainer></ChartCard></div><div className="metrics three"><MetricCard title="Melhor Mês" value="Fev/2026" detail="R$ 235K +5,6%" /><MetricCard title="Mês Atual vs Anterior" value="+8,2%" tone="green" /><MetricCard title="Média Mensal" value="R$ 208K" tone="slate" /></div></>}
      {tab === 'produtos' && <><div className="metrics three"><MetricCard title="SKUs Unicos" value="42" /><MetricCard title="Produto #1" value="P320" /><MetricCard title="Maior Margem" value="Holster" tone="green" /></div><div className="grid two"><ChartCard title="Top Produtos"><ResponsiveContainer height={320}><BarChart data={produtos} layout="vertical"><XAxis type="number" /><YAxis dataKey="nome" type="category" width={110} /><Tooltip formatter={(v) => formatCurrency(Number(v))} /><Bar dataKey="receita" fill="#1d4ed8" /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Mix por Tipo"><ResponsiveContainer height={320}><PieChart><Pie data={[{ tipo: 'PRODUTO', v: 470000 }, { tipo: 'SERVICO', v: 139000 }]} dataKey="v" nameKey="tipo" outerRadius={100}><Cell fill="#1d4ed8" /><Cell fill="#8b5cf6" /></Pie><Tooltip formatter={(v) => formatCurrency(Number(v))} /></PieChart></ResponsiveContainer></ChartCard></div><section className="panel"><h2>Produtos</h2><table><tbody>{produtos.map((p) => <tr key={p.nome}><td>{p.nome}</td><td>{p.curva}</td><td>{formatCurrency(p.receita)}</td><td><button>Ver Clientes</button></td></tr>)}</tbody></table></section></>}
      {tab === 'geografia' && <div className="grid two"><ChartCard title="Top Estados"><ResponsiveContainer height={320}><BarChart data={vendasPorEstado} layout="vertical"><XAxis type="number" /><YAxis dataKey="uf" type="category" /><Tooltip formatter={(v) => formatCurrency(Number(v))} /><Bar dataKey="receita" fill="#0f766e" /></BarChart></ResponsiveContainer></ChartCard><section className="panel"><h2>Heat Map Tabular</h2>{vendasPorEstado.map((e) => <div className="state-row" key={e.uf} onClick={() => setEstadoAberto(e.uf)}><strong>{e.uf}</strong><span>{e.estado}</span><i style={{ width: `${e.receita / 3500}px` }} />{estadoAberto === e.uf && <small>{e.cidades.map((c) => `${c.nome}: ${formatCurrency(c.valor)}`).join(' | ')}</small>}</div>)}</section></div>}
      {tab === 'b2b' && <div className="grid two"><ChartCard title="B2B vs B2C por Mês"><ResponsiveContainer height={320}><BarChart data={b2bB2cMensal}><XAxis dataKey="mes" /><YAxis /><Tooltip formatter={(v) => formatCurrency(Number(v))} /><Legend /><Bar dataKey="b2b" fill="#1d4ed8" /><Bar dataKey="b2c" fill="#10b981" /></BarChart></ResponsiveContainer></ChartCard><ChartCard title="Radar Comparativo"><ResponsiveContainer height={320}><RadarChart data={radar}><PolarGrid /><PolarAngleAxis dataKey="metrica" /><Radar dataKey="b2b" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.25} /><Radar dataKey="b2c" stroke="#10b981" fill="#10b981" fillOpacity={0.25} /></RadarChart></ResponsiveContainer></ChartCard></div>}
      {tab === 'abc' && <div className="grid two"><ChartCard title="Pareto de Receita"><ResponsiveContainer height={320}><ComposedChart data={clientes}><XAxis dataKey="nome" /><YAxis /><Tooltip /><Bar dataKey="receita" fill="#1d4ed8" /><Line dataKey="acumulado" stroke="#ef4444" strokeWidth={3} /></ComposedChart></ResponsiveContainer></ChartCard><section className="panel"><h2>Classificacao ABC</h2><table><tbody>{clientes.map((c, i) => <tr key={c.nome}><td>{c.nome}</td><td>{i < 2 ? 'A' : i === 2 ? 'B' : 'C'}</td><td>{formatPct(c.acumulado)}</td><td><button>Acao</button></td></tr>)}</tbody></table></section></div>}
    </div>
  );
}
