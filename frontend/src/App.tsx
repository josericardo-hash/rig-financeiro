import { useMemo, useState } from 'react';
import Sidebar, { PageDefinition } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import ContasReceber from './pages/ContasReceber';
import ContasPagar from './pages/ContasPagar';
import FluxoCaixa from './pages/FluxoCaixa';
import FinanceiroAvancado from './pages/FinanceiroAvancado';
import Comercial from './pages/Comercial';
import MapaVendas from './pages/MapaVendas';
import Vendas from './pages/Vendas';
import CRMClientes from './pages/CRMClientes';
import Campanhas from './pages/Campanhas';
import Forecast from './pages/Forecast';
import Configuracoes from './pages/Configuracoes';

const pages = [
  { id: 'dashboard', label: 'Dashboard', section: 'Executivo', component: Dashboard },
  { id: 'financeiro-avancado', label: 'Financeiro Avancado', section: 'Financeiro', component: FinanceiroAvancado },
  { id: 'contas-receber', label: 'Contas a Receber', section: 'Financeiro', component: ContasReceber },
  { id: 'contas-pagar', label: 'Contas a Pagar', section: 'Financeiro', component: ContasPagar },
  { id: 'fluxo-caixa', label: 'Fluxo de Caixa', section: 'Financeiro', component: FluxoCaixa },
  { id: 'comercial', label: 'Comercial', section: 'Comercial', component: Comercial },
  { id: 'mapa-vendas', label: 'Mapa de Vendas', section: 'Comercial', component: MapaVendas },
  { id: 'vendas', label: 'Vendas', section: 'Comercial', component: Vendas },
  { id: 'clientes-crm', label: 'Clientes CRM', section: 'CRM', component: CRMClientes },
  { id: 'campanhas', label: 'Campanhas', section: 'CRM', component: Campanhas },
  { id: 'forecast', label: 'Forecast', section: 'Planejamento', component: Forecast },
  { id: 'configuracoes', label: 'Configuracoes', section: 'Sistema', component: Configuracoes },
] satisfies PageDefinition[];

type PageId = typeof pages[number]['id'];

function App() {
  const getPageFromPath = () => {
    const path = window.location.pathname.replace(/^\//, '');
    return pages.some((page) => page.id === path) ? path as PageId : 'dashboard';
  };

  const [active, setActive] = useState<PageId>(getPageFromPath);
  const activePage = pages.find((page) => page.id === active) ?? pages[0];
  const ActivePage = useMemo(() => activePage.component, [activePage]);
  const handleNavigate = (id: PageId) => {
    setActive(id);
    window.history.pushState(null, '', `/${id}`);
  };

  return (
    <div className="shell">
      <Sidebar pages={pages} active={active} onNavigate={handleNavigate} />
      <div className="main-area">
        <Topbar activeLabel={activePage.label} />
        <main className="content">
          <ActivePage />
        </main>
      </div>
    </div>
  );
}

export default App;
