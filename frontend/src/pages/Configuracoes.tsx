import { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import { apiGet } from '../services/api';

type Status = { empresa_id: number; empresa_nome: string; oauth_configurado: boolean; token_valido: boolean; token_expira_em: string | null; ultimo_sync: string | null; registros_no_banco: { vendas: number; clientes: number; car: number; cap: number } };

const fallback: Status[] = [
  { empresa_id: 1, empresa_nome: 'Performa Extreme', oauth_configurado: true, token_valido: true, token_expira_em: '2026-06-10T20:00:00', ultimo_sync: '2026-06-10T09:03:59', registros_no_banco: { vendas: 128, clientes: 74, car: 91, cap: 82 } },
  { empresa_id: 2, empresa_nome: 'SIG', oauth_configurado: true, token_valido: false, token_expira_em: null, ultimo_sync: '2026-06-08T09:03:59', registros_no_banco: { vendas: 18, clientes: 21, car: 14, cap: 9 } },
  { empresa_id: 3, empresa_nome: 'CBA', oauth_configurado: false, token_valido: false, token_expira_em: null, ultimo_sync: null, registros_no_banco: { vendas: 0, clientes: 0, car: 0, cap: 0 } },
];

export default function Configuracoes() {
  const [status, setStatus] = useState(fallback);
  useEffect(() => { apiGet<Status[]>('/api/v1/auth/status', fallback).then(setStatus); }, []);
  return (
    <div className="page">
      <header><h1>Configuracoes</h1><p>Status da integracao Conta Azul e disponibilidade de dados reais.</p></header>
      <section className="grid three">{status.map((s) => <article className="panel" key={s.empresa_id}><h2>{s.empresa_nome}</h2><MetricCard title="OAuth" value={s.oauth_configurado ? 'Configurado' : 'Nao configurado'} tone={s.oauth_configurado ? 'green' : 'red'} /><MetricCard title="Token" value={s.token_valido ? 'Valido' : 'Expirado'} tone={s.token_valido ? 'green' : 'amber'} /><p>Ultimo sync: {s.ultimo_sync ?? '-'}</p><p>Vendas {s.registros_no_banco.vendas} | Clientes {s.registros_no_banco.clientes} | CAR {s.registros_no_banco.car} | CAP {s.registros_no_banco.cap}</p><button disabled={!s.oauth_configurado || !s.token_valido}>Sincronizar Agora</button>{!s.token_valido && s.oauth_configurado && <button>Renovar</button>}{!s.oauth_configurado && <button>Conectar</button>}</article>)}</section>
    </div>
  );
}
