import { useMemo, useState } from 'react';
import { Download, Mail, MessageCircle, Send } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { mockClientesCRM } from '../data/mock';
import { formatCurrency } from '../services/api';

const produtos = ['Todos', 'Pistola Sig Sauer P320', 'Pistola Sig Sauer P226', 'Colete Tático Modular', 'Holster Kydex P320'];
const Públicos = ['Todos', 'B2B', 'B2C'];
const curvas = ['Todas', 'A', 'B', 'C'];
const localidades = ['Todas', ...Array.from(new Set(mockClientesCRM.map((cliente) => cliente.estado))).sort()];

function copyText(value: string) {
  navigator.clipboard?.writeText(value).catch(() => undefined);
}

export default function Campanhas() {
  const [produto, setProduto] = useState('Todos');
  const [Público, setPúblico] = useState('Todos');
  const [curva, setCurva] = useState('Todas');
  const [localizacao, setLocalizacao] = useState('Todas');

  const clientes = useMemo(() => mockClientesCRM.filter((cliente) =>
    (produto === 'Todos' || cliente.produto_top === produto)
    && (Público === 'Todos' || cliente.perfil === Público)
    && (curva === 'Todas' || cliente.curva === curva)
    && (localizacao === 'Todas' || cliente.estado === localizacao)
  ), [curva, localizacao, produto, Público]);
  const receita = clientes.reduce((sum, cliente) => sum + cliente.valor, 0);
  const preview = clientes.slice(0, 5);
  const csv = ['cliente,email,whatsapp,perfil,curva,estado,produto', ...clientes.map((cliente) => `${cliente.cliente_nome},${cliente.email},${cliente.whatsapp},${cliente.perfil},${cliente.curva},${cliente.estado},${cliente.produto_top}`)].join('\n');

  return (
    <div className="page">
      <header>
        <div>
          <h1>Campanhas</h1>
          <p>Construtor de audiência para ações comerciais por produto, público, curva e localização.</p>
        </div>
      </header>
      <div className="metrics four">
        <MetricCard title="Clientes Encontrados" value={String(clientes.length)} tone="green" detail="contador atualizado pelos filtros" />
        <MetricCard title="Potencial" value={formatCurrency(receita)} tone="green" />
        <MetricCard title="Ticket Médio" value={formatCurrency(receita / Math.max(clientes.length, 1))} />
        <MetricCard title="Conversão Esperada" value="12,5%" tone="amber" />
      </div>

      <section className="audience-builder">
        <label className="filter-card">
          <span>Produto</span>
          <select value={produto} onChange={(event) => setProduto(event.target.value)}>{produtos.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="filter-card">
          <span>Público</span>
          <select value={Público} onChange={(event) => setPúblico(event.target.value)}>{Públicos.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="filter-card">
          <span>Curva</span>
          <select value={curva} onChange={(event) => setCurva(event.target.value)}>{curvas.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="filter-card">
          <span>Localização</span>
          <select value={localizacao} onChange={(event) => setLocalizacao(event.target.value)}>{localidades.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
      </section>

      <div className="grid two">
        <section className="panel campaign-preview">
          <div className="panel-title-row">
            <div>
              <h2>Prévia da Lista</h2>
              <p>Primeiros 5 clientes encontrados</p>
            </div>
            <strong className="animated-count">{clientes.length}</strong>
          </div>
          <table>
            <thead><tr><th>Cliente</th><th>Perfil</th><th>Curva</th><th>UF</th><th>Produto</th></tr></thead>
            <tbody>{preview.map((cliente) => <tr key={cliente.id}><td>{cliente.cliente_nome}</td><td>{cliente.perfil}</td><td>{cliente.curva}</td><td>{cliente.estado}</td><td>{cliente.produto_top}</td></tr>)}</tbody>
          </table>
        </section>
        <section className="panel campaign-preview">
          <h2>Mensagem Base</h2>
          <p>Olá, selecionamos uma oportunidade comercial alinhada ao seu histórico de compras e ao perfil da sua operação.</p>
          <div className="export-row">
            <button onClick={() => copyText(clientes.map((cliente) => cliente.email).join('; '))}><Mail size={16} /> Copiar Emails</button>
            <button onClick={() => copyText(clientes.map((cliente) => cliente.whatsapp).join('\n'))}><MessageCircle size={16} /> Copiar WhatsApps</button>
            <button onClick={() => copyText(csv)}><Download size={16} /> Exportar CSV</button>
            <button onClick={() => copyText(clientes.map((cliente) => `https://wa.me/${cliente.whatsapp}`).join('\n'))}><Send size={16} /> Lista WhatsApp Business</button>
          </div>
        </section>
      </div>

      <section className="panel">
        <h2>Audiência Completa</h2>
        <table>
          <thead><tr><th>Cliente</th><th>Contato</th><th>Perfil</th><th>Curva</th><th>UF</th><th>Valor</th></tr></thead>
          <tbody>{clientes.map((cliente) => <tr key={cliente.id}><td>{cliente.cliente_nome}</td><td>{cliente.email}<br /><small>{cliente.whatsapp}</small></td><td>{cliente.perfil}</td><td>{cliente.curva}</td><td>{cliente.estado}</td><td>{formatCurrency(cliente.valor)}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}

