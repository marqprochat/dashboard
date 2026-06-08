import KPICard from '../KPICard/KPICard';
import './KPIGrid.css';

export default function KPIGrid({ items }) {
  return (
    <div className="kpi-grid">
      {items.map((item, i) => (
        <KPICard key={i} {...item} />
      ))}
    </div>
  );
}
