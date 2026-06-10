import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { fluxoCompleto, fluxoSemanal, saldosContas } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

export default function FluxoCaixa() {
  const entradas = fluxoCompleto.entradas_realizadas + 18000;
  const saidas = fluxoCompleto.saidas_realizadas;
  return (
    <div className="page">
      <header><h1>Fluxo de Caixa</h1><p>Realizado versus previsto, DFC simplificado e saldos bancarios.</p></header>
      <div className="metrics four">
        <MetricCard title="Saldo Inicial" value={formatCurrency(fluxoCompleto.saldo_inicial)} />
        <MetricCard title="Entradas Realizadas" value={formatCurrency(fluxoCompleto.entradas_realizadas)} tone="green" />
        <MetricCard title="Saidas Realizadas" value={formatCurrency(fluxoCompleto.saidas_realizadas)} tone="red" />
        <MetricCard title="Saldo Final Realizado" value={formatCurrency(fluxoCompleto.saldo_final_realizado)} />
        <MetricCard title="Entradas Previstas" value={formatCurrency(fluxoCompleto.entradas_previstas)} tone="green" />
        <MetricCard title="Saidas Previstas" value={formatCurrency(fluxoCompleto.saidas_previstas)} tone="red" />
        <MetricCard title="Saldo Projetado" value={formatCurrency(fluxoCompleto.saldo_projetado)} />
        <MetricCard title="Variacao" value={formatPct(fluxoCompleto.variacao_pct)} tone="amber" />
      </div>
      <ChartCard title="Realizado vs Previsto por Semana">
        <ResponsiveContainer height={360}><ComposedChart data={fluxoSemanal}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="semana" /><YAxis tickFormatter={(v) => `${v / 1000}k`} /><Tooltip formatter={(v) => formatCurrency(Number(v))} /><Legend /><Bar dataKey="entradas_real" fill="#10b981" /><Bar dataKey="saidas_real" fill="#ef4444" /><Bar dataKey="entradas_prev" fill="#bbf7d0" /><Bar dataKey="saidas_prev" fill="#fecaca" /><Line dataKey="saldo_acum" stroke="#1d4ed8" strokeWidth={3} /><Line dataKey="saldo_proj" stroke="#60a5fa" strokeDasharray="6 4" strokeWidth={3} /></ComposedChart></ResponsiveContainer>
      </ChartCard>
      <section className="panel dfc"><h2>DFC Simplificado</h2><div><strong>ENTRADAS</strong><span>{formatCurrency(entradas)}</span></div><p>(+) Recebimentos de Clientes {formatCurrency(fluxoCompleto.entradas_realizadas)}</p><p>(+) Outras Entradas {formatCurrency(18000)}</p><div><strong>SAIDAS</strong><span>{formatCurrency(saidas)}</span></div><p>(-) Fornecedores e Servicos {formatCurrency(98200)}</p><p>(-) Pessoal e Encargos {formatCurrency(51000)}</p><p>(-) Impostos e Taxas {formatCurrency(22100)}</p><p>(-) Financeiro e Outros {formatCurrency(14000)}</p><div className="navy"><strong>RESULTADO DO PERIODO</strong><span>{formatCurrency(entradas - saidas)}</span></div><div><strong>SALDO FINAL</strong><span>{formatCurrency(fluxoCompleto.saldo_final_realizado)}</span></div></section>
      <section className="grid three">{saldosContas.map((conta) => <MetricCard key={conta.nome} title={`${conta.nome} - ${conta.tipo}`} value={formatCurrency(conta.saldo)} tone="slate" />)}</section>
    </div>
  );
}
