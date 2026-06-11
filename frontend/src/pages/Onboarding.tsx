import { CheckCircle2, Clock, Link2 } from 'lucide-react';

export default function Onboarding({ onDashboard }: { onDashboard: () => void }) {
  return (
    <div className="onboarding">
      <section className="onboarding-panel">
        <div className="onboarding-logo">RIG</div>
        <h1>Bem-vindo ao RIG Financeiro 2.0</h1>
        <p>Configure a conexão com o Conta Azul para carregar seus dados.</p>
        <div className="steps">
          <article>
            <CheckCircle2 size={24} />
            <strong>Passo 1</strong>
            <span>Sistema instalado</span>
          </article>
          <article>
            <Clock size={24} />
            <strong>Passo 2</strong>
            <span>Conectar Conta Azul</span>
            <button onClick={() => window.open('/configuracoes', '_self')}><Link2 size={16} /> Conectar</button>
          </article>
          <article>
            <Clock size={24} />
            <strong>Passo 3</strong>
            <span>Sincronizar dados</span>
            <button disabled>Sincronizar</button>
          </article>
        </div>
        <button className="primary-action" onClick={onDashboard}>Ir para o Dashboard</button>
      </section>
    </div>
  );
}
