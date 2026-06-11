import { RefreshCw, Search } from 'lucide-react';

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

export default function Topbar({ activeLabel }: { activeLabel: string }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <span>RIG</span>
        <div>
          <strong>RIG Financeiro 2.0</strong>
          <small>{activeLabel}</small>
        </div>
      </div>
      <div className="topbar-controls">
        <label>
          Empresa
          <select defaultValue="todas">
            <option value="todas">Todas</option>
            <option value="performa">Performa Extreme</option>
            <option value="sig">SIG do Brasil</option>
            <option value="cba">CBA Armas</option>
          </select>
        </label>
        <label>
          Início
          <input type="date" defaultValue={toInputDate(startOfMonth)} />
        </label>
        <label>
          Fim
          <input type="date" defaultValue={toInputDate(today)} />
        </label>
        <button className="icon-button" title="Pesquisar">
          <Search size={18} />
        </button>
        <button className="sync-button">
          <RefreshCw size={17} />
          <span>Sincronizar</span>
        </button>
      </div>
    </header>
  );
}
