import {
  BarChart3,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  Gauge,
  LineChart,
  MapPinned,
  Settings,
  ShoppingCart,
  Target,
  Users,
} from 'lucide-react';
import { ComponentType } from 'react';

const icons = {
  dashboard: Gauge,
  'financeiro-avancado': BriefcaseBusiness,
  'contas-receber': Banknote,
  'contas-pagar': CreditCard,
  'fluxo-caixa': LineChart,
  comercial: BarChart3,
  'mapa-vendas': MapPinned,
  vendas: ShoppingCart,
  'clientes-crm': Users,
  campanhas: CalendarDays,
  forecast: Target,
  configuracoes: Settings,
} as const;

export type PageDefinition = {
  id: keyof typeof icons;
  label: string;
  section: string;
  component: ComponentType;
};

type SidebarProps = {
  pages: PageDefinition[];
  active: PageDefinition['id'];
  onNavigate: (id: PageDefinition['id']) => void;
};

export default function Sidebar({ pages, active, onNavigate }: SidebarProps) {
  const sections = pages.reduce<Record<string, PageDefinition[]>>((acc, page) => {
    acc[page.section] = [...(acc[page.section] || []), page];
    return acc;
  }, {});

  return (
    <aside className="sidebar">
      <div className="brand">
        <strong>RIG Financeiro 2.0</strong>
        <span>Fase 12</span>
      </div>
      <nav>
        {Object.entries(sections).map(([section, items]) => (
          <div className="nav-section" key={section}>
            <small>{section}</small>
            {items.map(({ id, label }) => {
              const Icon = icons[id];
              return (
                <button key={id} className={active === id ? 'nav active' : 'nav'} onClick={() => onNavigate(id)} title={label}>
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
