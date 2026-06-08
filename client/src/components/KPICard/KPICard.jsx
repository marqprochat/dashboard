import './KPICard.css';

export default function KPICard({ label, value, subtitle, color = 'blue' }) {
  return (
    <div className="kpi-card" data-color={color}>
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-sub">{subtitle}</div>
    </div>
  );
}
