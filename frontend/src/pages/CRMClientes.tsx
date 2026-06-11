import { useMemo, useState } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { mockClientesCRM } from '../data/mock';
import { formatCurrency } from '../services/api';

export default function CRMClientes() {
  const [perfil, setPerfil] = useState('Todos');
  const [curva, setCurva] = useState('Todas');
  const [busca, setBusca] = useState('');
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const filtrados = useMemo(() => mockClientesCRM.filter((cliente) => {
    const termo = `${cliente.cliente_nome} ${cliente.cidade} ${cliente.estado} ${cliente.produto_top}`.toLowerCase();
    return (perfil === 'Todos' || cliente.perfil === perfil)
      && (curva === 'Todas' || cliente.curva === curva)
      && termo.includes(busca.toLowerCase());
  }), [busca, curva, perfil]);

  const receita = filtrados.reduce((sum, cliente) => sum + cliente.valor, 0);
  const toggle = (id: string) => setSelecionados((atual) => atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]);

  return (
    <div className="page">
      <header>
        <div>
          <h1>Clientes CRM</h1>
          <p>Segmentacao comercial com filtros por perfil, curva ABC, territorio e produto dominante.</p>
        </div>
      </header>
      <div className="metrics four">
        <MetricCard title="Clientes Filtrados" value={String(filtrados.length)} />
        <MetricCard title="Receita Selecionada" value={formatCurrency(receita)} tone="green" />
        <MetricCard title="Selecionados" value={String(selecionados.length)} tone="slate" />
        <MetricCard title="Ticket Medio" value={formatCurrency(receita / Math.max(filtrados.length, 1))} />
      </div>
      <section className="panel toolbar">
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente, cidade, produto" />
        <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
          <option>Todos</option><option>B2B</option><option>B2C</option>
        </select>
        <select value={curva} onChange={(e) => setCurva(e.target.value)}>
          <option>Todas</option><option>A</option><option>B</option><option>C</option>
        </select>
        <button className="sync-button">Criar Campanha</button>
      </section>
      <section className="panel">
        <h2>Base de Clientes</h2>
        <table>
          <thead><tr><th></th><th>Cliente</th><th>Perfil</th><th>UF/Cidade</th><th>Curva</th><th>Receita</th><th>Produto</th><th>Contato</th></tr></thead>
          <tbody>
            {filtrados.map((cliente) => (
              <tr key={cliente.id} className={selecionados.includes(cliente.id) ? 'selected-row' : ''}>
                <td><input type="checkbox" checked={selecionados.includes(cliente.id)} onChange={() => toggle(cliente.id)} /></td>
                <td><strong>{cliente.cliente_nome}</strong><br /><small>{cliente.email}</small></td>
                <td><span className="badge">{cliente.perfil}</span></td>
                <td>{cliente.estado}<br /><small>{cliente.cidade}</small></td>
                <td><span className={cliente.curva === 'A' ? 'badge green' : cliente.curva === 'B' ? 'badge amber' : 'badge'}>{cliente.curva}</span></td>
                <td>{formatCurrency(cliente.valor)}</td>
                <td>{cliente.produto_top}</td>
                <td className="contact-icons">
                  <a href={`mailto:${cliente.email}`} title="Email"><Mail size={16} /></a>
                  <a href={`https://wa.me/${cliente.whatsapp}`} title="WhatsApp"><MessageCircle size={16} /></a>
                  <a href={`tel:${cliente.telefone}`} title="Telefone"><Phone size={16} /></a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
