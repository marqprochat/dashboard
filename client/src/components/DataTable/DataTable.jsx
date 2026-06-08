import { fmt, fmtK, formatNumber } from '../../utils/formatters';
import { pKey } from '../../utils/csvParser';
import './DataTable.css';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export default function DataTable({ title, subtitle, data, barClass = 'bar-general', groupKey = 'unit' }) {
  // Group by key and aggregate
  const groups = {};
  const periods = new Set();

  data.forEach(r => {
    const key = r[groupKey] || 'Sem Unidade';
    periods.add(r.periodo);
    if (!groups[key]) {
      groups[key] = { prod: 0, atend: 0, horas: 0, pdW: 0, dentists: new Set() };
    }
    groups[key].prod += r.prod;
    groups[key].atend += r.atend;
    groups[key].horas += r.horas;
    groups[key].pdW += r.pdia * r.prod;
    if (r.dentist) groups[key].dentists.add(r.dentist);
  });

  const nMon = periods.size || 1;
  const sorted = Object.entries(groups).sort((a, b) => b[1].prod - a[1].prod);
  const maxProd = sorted[0]?.[1].prod || 1;

  if (!sorted.length) {
    return (
      <div className="data-table-wrapper">
        {title && <div className="data-table-title">{title}</div>}
        {subtitle && <div className="data-table-subtitle">{subtitle}</div>}
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>Sem resultados</h3>
          <p>Ajuste os filtros.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      {title && <div className="data-table-title">{title}</div>}
      {subtitle && <div className="data-table-subtitle">{subtitle}</div>}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{groupKey === 'unit' ? 'Unidade' : 'Dentista'}</th>
            <th>Produção Total</th>
            <th>Média/Mês</th>
            <th>Atend.</th>
            <th>Prod./Atend</th>
            <th>Prod./Hora</th>
            <th>Participação</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([name, s], i) => {
            const pa = s.atend > 0 ? Math.round(s.prod / s.atend) : 0;
            const ph = s.horas > 0 ? Math.round(s.prod / s.horas) : 0;
            const pct = Math.round((s.prod / maxProd) * 100);
            const prodMed = s.prod / nMon;

            return (
              <tr key={name}>
                <td>
                  {i < 3
                    ? <span className="rank-icon">{RANK_ICONS[i]}</span>
                    : <span className="rank-num">{i + 1}</span>
                  }
                </td>
                <td><strong>{name}</strong></td>
                <td><strong>{fmtK(s.prod)}</strong></td>
                <td>{fmtK(prodMed)}</td>
                <td>{formatNumber(s.atend)}</td>
                <td>{fmt(pa)}</td>
                <td>{fmt(ph)}</td>
                <td className="progress-cell">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="progress-bar-track" style={{ flex: 1 }}>
                      <div
                        className={`progress-bar-fill bar-mini ${barClass}`}
                        style={{ width: `${pct}%`, height: '5px' }}
                      />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 28 }}>{pct}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
