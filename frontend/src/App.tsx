import { useMemo, useState } from 'react';
import { BarChart3, Banknote, CreditCard, LineChart, MapPinned, Settings, ShoppingCart, TrendingUp } from 'lucide-react';
import ContasReceber from './pages/ContasReceber';
import ContasPagar from './pages/ContasPagar';
import FluxoCaixa from './pages/FluxoCaixa';
import Comercial from './pages/Comercial';
import MapaVendas from './pages/MapaVendas';
import Vendas from './pages/Vendas';
import Forecast from './pages/Forecast';
import Configuracoes from './pages/Configuracoes';

const pages = [
  { id: 'contas-receber', label: 'Contas a Receber', icon: Banknote, component: ContasReceber },
  { id: 'contas-pagar', label: 'Contas a Pagar', icon: CreditCard, component: ContasPagar },
  { id: 'fluxo-caixa', label: 'Fluxo de Caixa', icon: LineChart, component: FluxoCaixa },
  { id: 'comercial', label: 'Comercial', icon: BarChart3, component: Comercial },
  { id: 'mapa-vendas', label: 'Mapa de Vendas', icon: MapPinned, component: MapaVendas },
  { id: 'vendas', label: 'Vendas', icon: ShoppingCart, component: Vendas },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp, component: Forecast },
  { id: 'configuracoes', label: 'Configuracoes', icon: Settings, component: Configuracoes },
] as const;

function App() {
  const getPageFromPath = () => {
    const path = window.location.pathname.replace(/^\//, '');
    return pages.some((page) => page.id === path) ? path as typeof pages[number]['id'] : 'contas-receber';
  };

  const [active, setActive] = useState<typeof pages[number]['id']>(getPageFromPath);
  const ActivePage = useMemo(() => pages.find((page) => page.id === active)?.component ?? ContasReceber, [active]);
  const handleNavigate = (id: typeof pages[number]['id']) => {
    setActive(id);
    window.history.pushState(null, '', `/${id}`);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>RIG Financeiro 2.0</strong>
          <span>Fase 9</span>
        </div>
        <nav>
          {pages.map(({ id, label, icon: Icon }) => (
            <button key={id} className={active === id ? 'nav active' : 'nav'} onClick={() => handleNavigate(id)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        <ActivePage />
      </main>
    </div>
  );
}

export default App;
