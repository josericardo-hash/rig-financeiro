import { RefreshCw, Search } from 'lucide-react';

export default function Topbar({ activeLabel }: { activeLabel: string }) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <span>RIG</span>
        <strong>{activeLabel}</strong>
      </div>
      <div className="topbar-controls">
        <label>
          Empresa
          <select defaultValue="consolidado">
            <option value="consolidado">Consolidado</option>
            <option value="performa">Performa</option>
            <option value="sig">SIG</option>
            <option value="cba">CBA</option>
          </select>
        </label>
        <label>
          Periodo
          <select defaultValue="jun-2026">
            <option value="jun-2026">Jun/2026</option>
            <option value="mai-2026">Mai/2026</option>
            <option value="q2-2026">2T/2026</option>
          </select>
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
