import MapaBrasil from '../components/MapaBrasil';
import ChartCard from '../components/ChartCard';
import { vendasPorEstado } from '../data/mock';
import { formatCurrency } from '../services/api';

export default function MapaVendas() {
  return (
    <div className="page">
      <header><h1>Mapa de Vendas</h1><p>GeoJSON inline dos 27 estados, sem CDN ou fetch externo.</p></header>
      <ChartCard title="Brasil por Receita"><MapaBrasil estados={vendasPorEstado} /></ChartCard>
      <section className="panel"><h2>Ranking de Estados</h2><table><thead><tr><th>UF</th><th>Estado</th><th>Pedidos</th><th>Receita</th></tr></thead><tbody>{vendasPorEstado.map((e) => <tr key={e.uf}><td>{e.uf}</td><td>{e.estado}</td><td>{e.pedidos}</td><td>{formatCurrency(e.receita)}</td></tr>)}</tbody></table></section>
    </div>
  );
}
