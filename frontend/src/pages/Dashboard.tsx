import { AlertTriangle, Download, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartCard from '../components/ChartCard';
import { evolucaoRecebimentos, fluxoCompleto, forecastHistorico, mockEstados, pedidos } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

const agingCar = [
  { faixa: 'A vencer', valor: 206000, titulos: 18, risco: 'Baixo' },
  { faixa: 'Vencido até 30 dias', valor: 75000, titulos: 7, risco: 'Atenção' },
  { faixa: 'Vencido 31-90 dias', valor: 75000, titulos: 5, risco: 'Alto' },
  { faixa: 'Vencido 90+ dias', valor: 29000, titulos: 2, risco: 'Crítico' },
];

const devedores = [
  { cliente: 'Cliente B', valor: 42000, dias: 20, contato: 'financeiro@clienteb.com' },
  { cliente: 'Cliente C', valor: 29000, dias: 101, contato: 'cobranca@clientec.com' },
  { cliente: 'Cliente Norte Energia', valor: 26000, dias: 47, contato: 'ap@energia.com' },
  { cliente: 'Grupo Orion Industrial', valor: 23000, dias: 33, contato: 'compras@gruporion.com.br' },
  { cliente: 'Clube Tático RJ', valor: 18000, dias: 12, contato: 'financeiro@clubetatico.com' },
];

function SparkKpi({ title, value, detail, tone, points }: { title: string; value: string; detail: string; tone: string; points: string }) {
  return (
    <article className={`metric spark ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <svg viewBox="0 0 120 32" aria-hidden="true">
        <polyline points={points} />
      </svg>
      <small>{detail}</small>
    </article>
  );
}

export default function Dashboard() {
  const receita = mockEstados.reduce((sum, estado) => sum + estado.receita, 0);
  const pedidosTotal = mockEstados.reduce((sum, estado) => sum + estado.qtde_vendas, 0);
  const ticketMédio = receita / pedidosTotal;
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
          <p>Visão consolidada de receita, caixa, inadimplência, forecast e vendas recentes.</p>
        </div>
      </header>

      <section className="dashboard-alert">
        <AlertTriangle size={22} />
        <div>
          <strong>Inadimplência em atenção</strong>
          <span>{formatCurrency(104000)} vencidos acima de 31 dias. Priorizar contato com os 5 maiores devedores.</span>
        </div>
      </section>

      <div className="metrics four">
        <SparkKpi title="Receita" value={formatCurrency(receita)} detail="+8,2% vs mês anterior" tone="green" points="0,26 20,20 40,22 60,14 80,16 100,8 120,10" />
        <SparkKpi title="Pedidos" value={String(pedidosTotal)} detail="6 estados com venda" tone="slate" points="0,22 20,18 40,20 60,13 80,12 100,15 120,8" />
        <SparkKpi title="Ticket Médio" value={formatCurrency(ticketMédio)} detail="mix B2B elevando margem" tone="blue" points="0,20 20,24 40,17 60,15 80,12 100,13 120,9" />
        <SparkKpi title="Margem Média" value={formatPct(margemMedia)} detail="acima do mínimo operacional" tone="amber" points="0,18 20,17 40,16 60,15 80,14 100,12 120,11" />
      </div>

      <div className="grid two">
        <ChartCard title="Evolução Mensal">
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
        <ChartCard title="Recebimentos">
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
          <h2>Aging CAR</h2>
          <table>
            <thead><tr><th>Faixa</th><th>Títulos</th><th>Valor</th><th>Risco</th></tr></thead>
            <tbody>{agingCar.map((item) => <tr key={item.faixa}><td>{item.faixa}</td><td>{item.titulos}</td><td>{formatCurrency(item.valor)}</td><td><span className={item.risco === 'Crítico' ? 'badge red' : item.risco === 'Alto' ? 'badge amber' : 'badge green'}>{item.risco}</span></td></tr>)}</tbody>
          </table>
        </section>
        <section className="panel">
          <h2>Top 5 Devedores</h2>
          <table>
            <thead><tr><th>Cliente</th><th>Valor</th><th>Dias</th><th>Contato</th></tr></thead>
            <tbody>{devedores.map((item) => <tr key={item.cliente}><td>{item.cliente}</td><td>{formatCurrency(item.valor)}</td><td>{item.dias}</td><td>{item.contato}</td></tr>)}</tbody>
          </table>
        </section>
      </div>

      <div className="grid two">
        <section className="panel">
          <h2>Vendas Recentes</h2>
          <table>
            <thead><tr><th>Data</th><th>Cliente</th><th>Valor</th><th>Status</th></tr></thead>
            <tbody>{pedidos.map((pedido) => <tr key={pedido.id}><td>{pedido.data}</td><td>{pedido.cliente}</td><td>{formatCurrency(pedido.valor)}</td><td><span className="badge green">{pedido.status}</span></td></tr>)}</tbody>
          </table>
        </section>
        <section className="panel quick-actions">
          <h2>Ações Rápidas</h2>
          <button><RefreshCw size={17} /> Sincronizar Conta Azul</button>
          <button><Send size={17} /> Enviar cobrança dos críticos</button>
          <button><Download size={17} /> Exportar relatório executivo</button>
          <button><ShieldCheck size={17} /> Revisar conciliação</button>
        </section>
      </div>

      <footer className="sync-status">
        <span>SyncStatus</span>
        <strong>API online</strong>
        <small>Saldo projetado {formatCurrency(fluxoCompleto.saldo_projetado)}. OAuth Conta Azul pendente.</small>
      </footer>
    </div>
  );
}


