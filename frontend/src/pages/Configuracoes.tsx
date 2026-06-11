import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, RefreshCw, XCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { apiGet, apiPost } from '../services/api';

type Status = {
  empresa_id: number;
  empresa_nome: string;
  oauth_configurado: boolean;
  token_valido: boolean;
  token_expira_em: string | null;
  ultimo_sync: string | null;
  registros_no_banco: { vendas: number; clientes: number; car: number; cap: number };
};

type OAuthUrl = { empresa_id: number; authorization_url: string };
type ManualTokenResponse = { success: boolean; empresa: string };

const fallback: Status[] = [
  { empresa_id: 1, empresa_nome: 'Performa Extreme', oauth_configurado: false, token_valido: false, token_expira_em: null, ultimo_sync: null, registros_no_banco: { vendas: 0, clientes: 0, car: 0, cap: 0 } },
  { empresa_id: 2, empresa_nome: 'SIG do Brasil', oauth_configurado: false, token_valido: false, token_expira_em: null, ultimo_sync: null, registros_no_banco: { vendas: 0, clientes: 0, car: 0, cap: 0 } },
  { empresa_id: 3, empresa_nome: 'CBA Armas', oauth_configurado: false, token_valido: false, token_expira_em: null, ultimo_sync: null, registros_no_banco: { vendas: 0, clientes: 0, car: 0, cap: 0 } },
];

export default function Configuracoes() {
  const [status, setStatus] = useState(fallback);
  const [empresaManual, setEmpresaManual] = useState(1);
  const [manualCode, setManualCode] = useState('');
  const [feedback, setFeedback] = useState('');
  const totalRegistros = useMemo(() => status.reduce((sum, item) => sum + item.registros_no_banco.vendas + item.registros_no_banco.clientes + item.registros_no_banco.car + item.registros_no_banco.cap, 0), [status]);

  const carregarStatus = () => apiGet<Status[]>('/api/v1/auth/status', fallback).then(setStatus);

  useEffect(() => { carregarStatus(); }, []);

  async function conectar(empresaId: number) {
    const response = await apiGet<OAuthUrl>(`/api/v1/auth/contaazul/url?empresa_id=${empresaId}`, { empresa_id: empresaId, authorization_url: '' });
    if (response.authorization_url) window.open(response.authorization_url, '_blank', 'noopener,noreferrer');
  }

  async function sincronizar(empresaId: number) {
    setFeedback('Sincronizando dados...');
    try {
      await apiPost('/api/v1/sync/full', { empresa_id: empresaId });
      await carregarStatus();
      setFeedback('Sincronização finalizada. Verifique os registros no banco.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao sincronizar.');
    }
  }

  async function confirmarAutorizacao() {
    if (!manualCode.trim()) {
      setFeedback('Cole o code retornado pelo Conta Azul.');
      return;
    }
    setFeedback('Confirmando autorização...');
    try {
      const response = await apiPost<ManualTokenResponse>('/api/v1/auth/contaazul/manual-token', { empresa_id: empresaManual, code: manualCode.trim() });
      setFeedback(`Autorização confirmada para ${response.empresa}. Sincronizando...`);
      await sincronizar(empresaManual);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao confirmar autorização.');
    }
  }

  return (
    <div className="page">
      <header>
        <div>
          <h1>Configurações</h1>
          <p>Conexão Conta Azul, autorização manual e sincronização de dados reais.</p>
        </div>
      </header>

      <div className="metrics four">
        <MetricCard title="Empresas" value={String(status.length)} />
        <MetricCard title="Conectadas" value={String(status.filter((item) => item.token_valido).length)} tone="green" />
        <MetricCard title="Registros" value={String(totalRegistros)} tone={totalRegistros > 0 ? 'green' : 'amber'} />
        <MetricCard title="OAuth" value={status.some((item) => item.token_valido) ? 'Ativo' : 'Pendente'} tone={status.some((item) => item.token_valido) ? 'green' : 'red'} />
      </div>

      <section className="grid three">
        {status.map((empresa) => {
          const conectado = empresa.oauth_configurado && empresa.token_valido;
          return (
            <article className="panel oauth-card" key={empresa.empresa_id}>
              <div className="panel-title-row">
                <h2>{empresa.empresa_nome}</h2>
                <span className={conectado ? 'badge green' : 'badge red'}>
                  {conectado ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {conectado ? 'Conectado' : 'Não conectado'}
                </span>
              </div>
              <p>Último sync: {empresa.ultimo_sync ? new Date(empresa.ultimo_sync).toLocaleString('pt-BR') : '-'}</p>
              <div className="metrics mini">
                <div><span>Vendas</span><strong>{empresa.registros_no_banco.vendas}</strong></div>
                <div><span>Clientes</span><strong>{empresa.registros_no_banco.clientes}</strong></div>
                <div><span>CAR</span><strong>{empresa.registros_no_banco.car}</strong></div>
                <div><span>CAP</span><strong>{empresa.registros_no_banco.cap}</strong></div>
              </div>
              {conectado ? (
                <button className="primary-action green" onClick={() => sincronizar(empresa.empresa_id)}><RefreshCw size={16} /> Sincronizar</button>
              ) : (
                <button className="primary-action" onClick={() => conectar(empresa.empresa_id)}><ExternalLink size={16} /> Conectar Conta Azul</button>
              )}
            </article>
          );
        })}
      </section>

      <section className="panel manual-auth">
        <h2>Autorização Manual</h2>
        <p>Depois do login no Conta Azul, copie o parâmetro <strong>code</strong> da URL de retorno e confirme aqui.</p>
        <div className="toolbar">
          <select value={empresaManual} onChange={(event) => setEmpresaManual(Number(event.target.value))}>
            {status.map((empresa) => <option value={empresa.empresa_id} key={empresa.empresa_id}>{empresa.empresa_nome}</option>)}
          </select>
          <input value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Cole o code da URL de retorno" />
          <button className="sync-button" onClick={confirmarAutorizacao}>Confirmar Autorização</button>
        </div>
        {feedback && <p className="alert">{feedback}</p>}
      </section>
    </div>
  );
}
