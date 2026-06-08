import './ChartCard.css';

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-title">{title}</div>
      <div className="chart-card-subtitle">{subtitle}</div>
      {children}
    </div>
  );
}
