import { useState } from 'react';
import MapaBrasil from '../components/MapaBrasil';
import { mockCidadesPorEstado, mockClientesPorCidade, mockEstados } from '../data/mock';
import { formatCurrency, formatPct } from '../services/api';

type Nivel = 'brasil' | 'estado' | 'cidade';
type Metrica = 'receita' | 'qtde_vendas' | 'ticket_medio' | 'margem_pct';

export default function MapaVendas() {
  const [nivel, setNivel] = useState<Nivel>('brasil');
  const [estadoSel, setEstadoSel] = useState<string | null>(null);
  const [cidadeSel, setCidadeSel] = useState<string | null>(null);
  const [metrica, setMetrica] = useState<Metrica>('receita');

  const estadoObj = mockEstados.find((estado) => estado.uf === estadoSel);
  const cidades = estadoSel ? (mockCidadesPorEstado[estadoSel] || []) : [];
  const clientes = cidadeSel ? (mockClientesPorCidade[cidadeSel] || []) : [];

  const handleEstadoClick = (uf: string) => {
    setEstadoSel(uf);
    setCidadeSel(null);
    setNivel('estado');
  };

  const handleCidadeClick = (cidade: string) => {
    setCidadeSel(cidade);
    setNivel('cidade');
  };

  const voltarPara = (target: Nivel) => {
    setNivel(target);
    if (target === 'brasil') {
      setEstadoSel(null);
      setCidadeSel(null);
    }
    if (target === 'estado') setCidadeSel(null);
  };

  const totalReceita = mockEstados.reduce((sum, estado) => sum + estado.receita, 0);
  const totalPedidos = mockEstados.reduce((sum, estado) => sum + estado.qtde_vendas, 0);
  const ticketMédio = totalPedidos ? totalReceita / totalPedidos : 0;

  return (
    <div className="page">
      <header>
        <div>
          <h1>Mapa de Vendas</h1>
          <p>Drill-down Brasil, estado, cidade e clientes.</p>
          <div className="breadcrumb">
            <button className={nivel === 'brasil' ? 'active' : ''} onClick={() => voltarPara('brasil')}>Brasil</button>
            {estadoSel && <><span>/</span><button className={nivel === 'estado' ? 'active' : ''} onClick={() => voltarPara('estado')}>{estadoSel}</button></>}
            {cidadeSel && <><span>/</span><strong>{cidadeSel}</strong></>}
          </div>
        </div>
        <select value={metrica} onChange={(event) => setMetrica(event.target.value as Metrica)}>
          <option value="receita">Receita</option>
          <option value="qtde_vendas">Quantidade</option>
          <option value="ticket_medio">Ticket Médio</option>
          <option value="margem_pct">Margem %</option>
        </select>
      </header>

      <div className="map-layout">
        <section className="panel">
          {nivel === 'brasil' && (
            <MapaBrasil estados={mockEstados} estadoSelecionado={estadoSel} onEstadoClick={handleEstadoClick} metrica={metrica} />
          )}

          {(nivel === 'estado' || nivel === 'cidade') && (
            <div>
              <h2>Cidades - {estadoObj?.nome_estado}</h2>
              <table>
                <thead>
                  <tr><th>Cidade</th><th>Receita</th><th>Pedidos</th><th>Participação</th></tr>
                </thead>
                <tbody>
                  {cidades.map((cidade) => (
                    <tr key={cidade.cidade} onClick={() => handleCidadeClick(cidade.cidade)} className={cidadeSel === cidade.cidade ? 'selected-row' : ''}>
                      <td>{cidade.cidade}</td>
                      <td>{formatCurrency(cidade.receita)}</td>
                      <td>{cidade.qtde_vendas}</td>
                      <td>
                        <span>{formatPct(cidade.participacao_pct)}</span>
                        <div className="mini-bar"><i style={{ width: `${cidade.participacao_pct}%` }} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="side-panel">
          {nivel === 'brasil' && (
            <>
              <section className="panel compact">
                <h2>Brasil - Resumo</h2>
                <div className="metrics mini">
                  <div><span>Receita Total</span><strong>{formatCurrency(totalReceita)}</strong></div>
                  <div><span>Pedidos</span><strong>{totalPedidos}</strong></div>
                  <div><span>Estados c/ vendas</span><strong>{mockEstados.length}</strong></div>
                  <div><span>Ticket Médio</span><strong>{formatCurrency(ticketMédio)}</strong></div>
                </div>
              </section>
              <section className="panel compact">
                <h2>Top 5 Estados</h2>
                {[...mockEstados].sort((a, b) => b.receita - a.receita).slice(0, 5).map((estado, index) => (
                  <button key={estado.uf} className="ranking-row" onClick={() => handleEstadoClick(estado.uf)}>
                    <span>{index + 1}</span>
                    <strong>{estado.uf}</strong>
                    <i><b style={{ width: `${estado.participacao_pct}%` }} /></i>
                    <em>{formatCurrency(estado.receita)}</em>
                  </button>
                ))}
              </section>
            </>
          )}

          {nivel === 'estado' && estadoObj && (
            <section className="panel compact">
              <div className="panel-title-row">
                <h2>{estadoObj.uf} - {estadoObj.nome_estado}</h2>
                <button onClick={() => voltarPara('brasil')}>Voltar</button>
              </div>
              <div className="metrics mini">
                <div><span>Receita</span><strong>{formatCurrency(estadoObj.receita)}</strong></div>
                <div><span>Pedidos</span><strong>{estadoObj.qtde_vendas}</strong></div>
                <div><span>Ticket Médio</span><strong>{formatCurrency(estadoObj.ticket_medio)}</strong></div>
                <div><span>Participação</span><strong>{formatPct(estadoObj.participacao_pct)}</strong></div>
              </div>
              <p>Clique em uma cidade para ver os clientes.</p>
              <button className="primary-action" onClick={() => { window.location.href = `/clientes-crm?estado=${estadoObj.uf}`; }}>Ver clientes deste estado</button>
            </section>
          )}

          {nivel === 'cidade' && cidadeSel && (
            <section className="panel compact">
              <div className="panel-title-row">
                <h2>{cidadeSel}</h2>
                <button onClick={() => voltarPara('estado')}>Voltar</button>
              </div>
              <h3>Clientes nesta cidade</h3>
              {clientes.map((cliente) => (
                <article className="client-card" key={cliente.cliente_nome}>
                  <div><strong>{cliente.cliente_nome}</strong><span>{cliente.perfil}</span></div>
                  <p>{formatCurrency(cliente.receita)} - {cliente.top_produto}</p>
                  <div className="contact-row">
                    <a href={`mailto:${cliente.email}`}>Email</a>
                    <a href={`https://wa.me/${cliente.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  </div>
                </article>
              ))}
              <button className="primary-action green" onClick={() => { window.location.href = `/campanhas?cidade=${cidadeSel}&estado=${estadoSel}`; }}>Criar campanha desta cidade</button>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}


