import { useEffect, useMemo, useState } from 'react';
import { Download, Mail, MessageCircle, Phone } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { mockClientesCRM } from '../data/mock';
import { formatCurrency } from '../services/api';

type ClienteCRM = typeof mockClientesCRM[number];

function copyText(value: string) {
  navigator.clipboard?.writeText(value).catch(() => undefined);
}

function exportCsv(clientes: ClienteCRM[]) {
  const header = 'cliente,perfil,curva,estado,cidade,email,whatsapp,valor';
  const rows = clientes.map((cliente) => [
    cliente.cliente_nome,
    cliente.perfil,
    cliente.curva,
    cliente.estado,
    cliente.cidade,
    cliente.email,
    cliente.whatsapp,
    cliente.valor,
  ].join(','));
  copyText([header, ...rows].join('\n'));
}

export default function CRMClientes() {
  const [perfil, setPerfil] = useState('Todos');
  const [curva, setCurva] = useState('Todas');
  const [estado, setEstado] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [clienteAberto, setClienteAberto] = useState<ClienteCRM | null>(mockClientesCRM[0] ?? null);
  const estados = useMemo(() => Array.from(new Set(mockClientesCRM.map((cliente) => cliente.estado))).sort(), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBuscaDebounced(busca), 250);
    return () => window.clearTimeout(timer);
  }, [busca]);

  const filtrados = useMemo(() => mockClientesCRM.filter((cliente) => {
    const termo = `${cliente.cliente_nome} ${cliente.cidade} ${cliente.estado} ${cliente.produto_top}`.toLowerCase();
    return (perfil === 'Todos' || cliente.perfil === perfil)
      && (curva === 'Todas' || cliente.curva === curva)
      && (estado === 'Todos' || cliente.estado === estado)
      && termo.includes(buscaDebounced.toLowerCase());
  }), [buscaDebounced, curva, estado, perfil]);

  const clientesSelecionados = filtrados.filter((cliente) => selecionados.includes(cliente.id));
  const receita = filtrados.reduce((sum, cliente) => sum + cliente.valor, 0);
  const toggle = (id: string) => setSelecionados((atual) => atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]);
  const contatos = clientesSelecionados.length > 0 ? clientesSelecionados : filtrados;

  return (
    <div className="page">
      <header>
        <div>
          <h1>CRM - Clientes</h1>
          <p>Segmentação comercial com filtros por perfil, curva ABC, território e produto dominante.</p>
        </div>
      </header>
      <div className="metrics four">
        <MetricCard title="Clientes Filtrados" value={String(filtrados.length)} />
        <MetricCard title="Receita Selecionada" value={formatCurrency(receita)} tone="green" />
        <MetricCard title="Selecionados" value={String(selecionados.length)} tone="slate" />
        <MetricCard title="Ticket Médio" value={formatCurrency(receita / Math.max(filtrados.length, 1))} />
      </div>
      <section className="panel toolbar">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente por nome, cidade ou produto" />
        <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
          <option>Todos</option><option>B2B</option><option>B2C</option>
        </select>
        <select value={curva} onChange={(e) => setCurva(e.target.value)}>
          <option>Todas</option><option>A</option><option>B</option><option>C</option>
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option>Todos</option>{estados.map((uf) => <option key={uf}>{uf}</option>)}
        </select>
      </section>
      {selecionados.length > 0 && (
        <section className="selection-toolbar">
          <strong>{selecionados.length} selecionados</strong>
          <button onClick={() => copyText(clientesSelecionados.map((cliente) => cliente.email).join('; '))}>Copiar Emails</button>
          <button onClick={() => copyText(clientesSelecionados.map((cliente) => cliente.whatsapp).join('\n'))}>Copiar WhatsApps</button>
          <button onClick={() => exportCsv(clientesSelecionados)}><Download size={16} /> Exportar CSV</button>
        </section>
      )}
      <div className="crm-layout">
        <section className="panel">
          <h2>Base de Clientes</h2>
          <table>
            <thead><tr><th></th><th>Cliente</th><th>Perfil</th><th>UF/Cidade</th><th>Curva</th><th>Receita</th><th>Produto</th><th>Contato</th></tr></thead>
            <tbody>
              {filtrados.map((cliente) => (
                <tr key={cliente.id} className={selecionados.includes(cliente.id) ? 'selected-row' : ''} onClick={() => setClienteAberto(cliente)}>
                  <td onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selecionados.includes(cliente.id)} onChange={() => toggle(cliente.id)} /></td>
                  <td><strong>{cliente.cliente_nome}</strong><br /><small>{cliente.email}</small></td>
                  <td><span className="badge">{cliente.perfil}</span></td>
                  <td>{cliente.estado}<br /><small>{cliente.cidade}</small></td>
                  <td><span className={cliente.curva === 'A' ? 'badge green' : cliente.curva === 'B' ? 'badge amber' : 'badge'}>{cliente.curva}</span></td>
                  <td>{formatCurrency(cliente.valor)}</td>
                  <td>{cliente.produto_top}</td>
                  <td className="contact-icons" onClick={(event) => event.stopPropagation()}>
                    <a href={`mailto:${cliente.email}`} title="Email"><Mail size={16} /></a>
                    <a href={`https://wa.me/${cliente.whatsapp}`} title="WhatsApp"><MessageCircle size={16} /></a>
                    <a href={`tel:${cliente.telefone}`} title="Telefone"><Phone size={16} /></a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <aside className="drawer panel">
          <h2>Perfil Completo</h2>
          {clienteAberto && (
            <>
              <strong>{clienteAberto.cliente_nome}</strong>
              <span className="badge">{clienteAberto.perfil}</span>
              <div className="drawer-grid">
                <div><span>Curva</span><strong>{clienteAberto.curva}</strong></div>
                <div><span>Estado</span><strong>{clienteAberto.estado}</strong></div>
                <div><span>Cidade</span><strong>{clienteAberto.cidade}</strong></div>
                <div><span>Receita</span><strong>{formatCurrency(clienteAberto.valor)}</strong></div>
              </div>
              <p>{clienteAberto.produto_top}</p>
              <div className="contact-stack">
                <button onClick={() => copyText(clienteAberto.email)}><Mail size={16} /> {clienteAberto.email}</button>
                <button onClick={() => copyText(clienteAberto.whatsapp)}><MessageCircle size={16} /> {clienteAberto.whatsapp}</button>
                <button onClick={() => copyText(clienteAberto.telefone)}><Phone size={16} /> {clienteAberto.telefone}</button>
              </div>
            </>
          )}
        </aside>
      </div>
      <section className="panel">
        <h2>Exportação Rápida</h2>
        <div className="export-row">
          <button onClick={() => copyText(contatos.map((cliente) => cliente.email).join('; '))}>Copiar Emails</button>
          <button onClick={() => copyText(contatos.map((cliente) => cliente.whatsapp).join('\n'))}>Copiar WhatsApps</button>
          <button onClick={() => exportCsv(contatos)}>Exportar CSV</button>
        </div>
      </section>
    </div>
  );
}
