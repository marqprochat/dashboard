import { fmtK } from '../../utils/formatters';
import './SpecSummary.css';

function SpecPanel({ type, label, emoji, metrics }) {
  const cls = type; // 'clinico' or 'ortho'
  return (
    <div className="spec-panel">
      <div className={`spec-panel-head ${cls}`}>
        <span className={`badge badge-${cls}`}>{emoji} {label}</span>
        <h3>Resumo {label}</h3>
      </div>
      <div className="spec-panel-body">
        <div>
          <div className="spec-metric-label">Produção</div>
          <div className={`spec-metric-value ${cls}`}>{fmtK(metrics.prod)}</div>
        </div>
        <div>
          <div className="spec-metric-label">/ Atendimento</div>
          <div className={`spec-metric-value ${cls}`}>{fmtK(metrics.pa)}</div>
        </div>
        <div>
          <div className="spec-metric-label">/ Hora</div>
          <div className={`spec-metric-value ${cls}`}>{fmtK(metrics.ph)}</div>
        </div>
        <div>
          <div className="spec-metric-label">/ Dia</div>
          <div className={`spec-metric-value ${cls}`}>{fmtK(metrics.pd)}</div>
        </div>
      </div>
    </div>
  );
}

export default function SpecSummary({ clinicoMetrics, orthoMetrics }) {
  return (
    <div className="spec-summary">
      <SpecPanel type="clinico" label="Clínico" emoji="🩺" metrics={clinicoMetrics} />
      <SpecPanel type="ortho" label="Ortodontia" emoji="😁" metrics={orthoMetrics} />
    </div>
  );
}
