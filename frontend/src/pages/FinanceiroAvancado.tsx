import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import { fluxoCompleto, fluxoSemanal, gruposDespesa, saldosContas } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

export default function FinanceiroAvancado() {
  const ebitda = fluxoCompleto.entradas_realizadas - fluxoCompleto.saidas_realizadas;
  const margem = (ebitda / fluxoCompleto.entradas_realizadas) * 100;

  return (
    <div className="page">
      <header>
        <div>
          <h1>Financeiro Avancado</h1>
          <p>DRE gerencial, liquidez, contas e composicao de despesas para decisao executiva.</p>
        </div>
      </header>
      <div className="metrics five">
        <MetricCard title="Receita Operacional" value={formatCurrency(fluxoCompleto.entradas_realizadas)} />
        <MetricCard title="Despesas Operacionais" value={formatCurrency(fluxoCompleto.saidas_realizadas)} tone="red" />
        <MetricCard title="EBITDA Gerencial" value={formatCurrency(ebitda)} tone="green" />
        <MetricCard title="Margem EBITDA" value={formatPct(margem)} tone="green" />
        <MetricCard title="Liquidez Projetada" value={formatCurrency(fluxoCompleto.saldo_projetado)} tone="slate" />
      </div>
      <div className="grid two">
        <ChartCard title="Saldo Acumulado e Projetado">
          <ResponsiveContainer height={320}>
            <AreaChart data={fluxoSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis tickFormatter={(v) => `${Number(v) / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Area dataKey="saldo_acum" stroke="#2563eb" fill="#dbeafe" />
              <Area dataKey="saldo_proj" stroke="#10b981" fill="#dcfce7" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Despesas por Grupo">
          <ResponsiveContainer height={320}>
            <BarChart data={gruposDespesa} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `${Number(v) / 1000}k`} />
              <YAxis dataKey="grupo" type="category" width={130} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="valor" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <section className="grid three">
        {saldosContas.map((conta) => (
          <MetricCard key={conta.nome} title={conta.nome} value={formatCurrency(conta.saldo)} detail={conta.tipo} tone="slate" />
        ))}
      </section>
    </div>
  );
}
