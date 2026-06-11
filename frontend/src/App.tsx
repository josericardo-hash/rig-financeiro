import { useEffect, useMemo, useState } from 'react';
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
import Onboarding from './pages/Onboarding';
import { apiGet } from './services/api';

const pages = [
  { id: 'dashboard', label: 'Dashboard', section: 'Executivo', component: Dashboard },
  { id: 'financeiro-avancado', label: 'Financeiro+', section: 'Financeiro', component: FinanceiroAvancado },
  { id: 'contas-receber', label: 'Contas a Receber', section: 'Financeiro', component: ContasReceber },
  { id: 'contas-pagar', label: 'Contas a Pagar', section: 'Financeiro', component: ContasPagar },
  { id: 'fluxo-caixa', label: 'Fluxo de Caixa', section: 'Financeiro', component: FluxoCaixa },
  { id: 'comercial', label: 'Comercial', section: 'Comercial', component: Comercial },
  { id: 'mapa-vendas', label: 'Mapa de Vendas', section: 'Comercial', component: MapaVendas },
  { id: 'vendas', label: 'Vendas', section: 'Comercial', component: Vendas },
  { id: 'clientes-crm', label: 'CRM - Clientes', section: 'CRM', component: CRMClientes },
  { id: 'campanhas', label: 'Campanhas', section: 'CRM', component: Campanhas },
  { id: 'forecast', label: 'Forecast', section: 'Planejamento', component: Forecast },
  { id: 'configuracoes', label: 'Configurações', section: 'Sistema', component: Configuracoes },
] satisfies PageDefinition[];

type PageId = typeof pages[number]['id'] | 'onboarding';
type StatusResumo = Array<{ registros_no_banco: { vendas: number; clientes: number; car: number; cap: number } }>;

function App() {
  const getPageFromPath = () => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'onboarding') return 'onboarding';
    return pages.some((page) => page.id === path) ? path as PageId : 'dashboard';
  };

  const [active, setActive] = useState<PageId>(getPageFromPath);
  const activePage = pages.find((page) => page.id === active) ?? pages[0];
  const ActivePage = useMemo(() => activePage.component, [activePage]);

  const handleNavigate = (id: PageDefinition['id']) => {
    setActive(id);
    window.history.pushState(null, '', `/${id}`);
  };

  const goDashboard = () => {
    sessionStorage.setItem('rig-dashboard-liberado', 'true');
    setActive('dashboard');
    window.history.pushState(null, '', '/dashboard');
  };

  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path && path !== 'dashboard') return;
    if (sessionStorage.getItem('rig-dashboard-liberado') === 'true') return;

    apiGet<StatusResumo>('/api/v1/auth/status', []).then((status) => {
      const total = status.reduce((sum, item) => sum + item.registros_no_banco.vendas + item.registros_no_banco.clientes + item.registros_no_banco.car + item.registros_no_banco.cap, 0);
      if (total === 0) {
        setActive('onboarding');
        window.history.replaceState(null, '', '/onboarding');
      }
    });
  }, []);

  return (
    <div className="shell">
      <Sidebar pages={pages} active={active === 'onboarding' ? 'dashboard' : active} onNavigate={handleNavigate} />
      <div className="main-area">
        <Topbar activeLabel={active === 'onboarding' ? 'Onboarding' : activePage.label} />
        <main className="content">
          {active === 'onboarding' ? <Onboarding onDashboard={goDashboard} /> : <ActivePage />}
        </main>
      </div>
    </div>
  );
}

export default App;
