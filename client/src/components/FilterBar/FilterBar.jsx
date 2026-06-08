import './FilterBar.css';

export default function FilterBar({ filters, setters, options, onClear }) {
  const { spec, unit, dentist, monthStart, yearStart, monthEnd, yearEnd } = filters;
  const { setSpec, setUnit, setDentist, setMonthStart, setYearStart, setMonthEnd, setYearEnd } = setters;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="f-spec">Especialidade</label>
        <select id="f-spec" value={spec} onChange={e => setSpec(e.target.value)}>
          <option value="">Todas</option>
          <option value="clinico">Clínico</option>
          <option value="ortho">Ortodontia</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-unit">Unidade</label>
        <select id="f-unit" value={unit} onChange={e => setUnit(e.target.value)}>
          <option value="">Todas</option>
          {options.units.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-dent">Dentista</label>
        <select id="f-dent" value={dentist} onChange={e => setDentist(e.target.value)}>
          <option value="">Todos</option>
          {options.dentists.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-month-start">Mês De</label>
        <select id="f-month-start" value={monthStart} onChange={e => setMonthStart(e.target.value)}>
          <option value="">Todos</option>
          {options.months.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-year-start">Ano De</label>
        <select id="f-year-start" value={yearStart} onChange={e => setYearStart(e.target.value)}>
          <option value="">Todos</option>
          {options.years.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-sep">até</div>

      <div className="filter-group">
        <label htmlFor="f-month-end">Mês Até</label>
        <select id="f-month-end" value={monthEnd} onChange={e => setMonthEnd(e.target.value)}>
          <option value="">Todos</option>
          {options.months.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-year-end">Ano Até</label>
        <select id="f-year-end" value={yearEnd} onChange={e => setYearEnd(e.target.value)}>
          <option value="">Todos</option>
          {options.years.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-actions">
        <button className="btn btn-ghost" onClick={onClear}>Limpar</button>
      </div>
    </div>
  );
}
