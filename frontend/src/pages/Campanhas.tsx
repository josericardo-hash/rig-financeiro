import { useMemo, useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { mockClientesCRM } from '../data/mock';
import { formatCurrency } from '../services/api';

const canais = ['WhatsApp', 'Email', 'Telefone'];
const templates = [
  { id: 'reativacao', nome: 'Reativacao de Carteira', foco: 'Clientes sem compra recente', canal: 'WhatsApp' },
  { id: 'cross-sell', nome: 'Cross-sell Operacional', foco: 'Produtos complementares', canal: 'Email' },
  { id: 'vip', nome: 'Relacionamento VIP', foco: 'Curva A B2B', canal: 'Telefone' },
];

export default function Campanhas() {
  const [canal, setCanal] = useState('WhatsApp');
  const [perfil, setPerfil] = useState('Todos');
  const publico = useMemo(() => mockClientesCRM.filter((cliente) =>
    (perfil === 'Todos' || cliente.perfil === perfil) && (perfil !== 'B2B' || cliente.curva !== 'C')
  ), [perfil]);
  const receita = publico.reduce((sum, cliente) => sum + cliente.valor, 0);

  return (
    <div className="page">
      <header>
        <div>
          <h1>Campanhas</h1>
          <p>Planejamento de acoes comerciais por canal, segmento e potencial de receita.</p>
        </div>
      </header>
      <div className="metrics four">
        <MetricCard title="Publico Alvo" value={String(publico.length)} />
        <MetricCard title="Potencial" value={formatCurrency(receita)} tone="green" />
        <MetricCard title="Canal Principal" value={canal} tone="slate" />
        <MetricCard title="Conversao Esperada" value="12,5%" tone="amber" />
      </div>
      <section className="panel toolbar">
        <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
          <option>Todos</option><option>B2B</option><option>B2C</option>
        </select>
        <div className="segmented">
          {canais.map((item) => <button key={item} className={canal === item ? 'active' : ''} onClick={() => setCanal(item)}>{item}</button>)}
        </div>
        <button className="sync-button"><Send size={16} /> Disparar Lista</button>
      </section>
      <div className="campaign-grid">
        {templates.map((template) => (
          <section className="panel campaign-card" key={template.id}>
            <div className="panel-title-row">
              <div>
                <h2>{template.nome}</h2>
                <p>{template.foco}</p>
              </div>
              {template.canal === 'Email' ? <Mail size={20} /> : <MessageCircle size={20} />}
            </div>
            <div className="metrics mini">
              <div><span>Clientes</span><strong>{publico.length}</strong></div>
              <div><span>Receita potencial</span><strong>{formatCurrency(receita)}</strong></div>
            </div>
            <div className="campaign-preview">
              <strong>Preview</strong>
              <p>Ola, temos uma oportunidade selecionada para sua operacao com base no seu historico recente de compras.</p>
            </div>
            <button className="primary-action">Montar Campanha</button>
          </section>
        ))}
      </div>
      <section className="panel">
        <h2>Clientes no Publico</h2>
        <table>
          <thead><tr><th>Cliente</th><th>Perfil</th><th>Curva</th><th>UF</th><th>Produto</th><th>Valor</th></tr></thead>
          <tbody>{publico.map((cliente) => <tr key={cliente.id}><td>{cliente.cliente_nome}</td><td>{cliente.perfil}</td><td>{cliente.curva}</td><td>{cliente.estado}</td><td>{cliente.produto_top}</td><td>{formatCurrency(cliente.valor)}</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
