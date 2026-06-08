import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import Header from '../../components/Header/Header';
import SyncPanel from '../../components/SyncPanel/SyncPanel';
import FilterBar from '../../components/FilterBar/FilterBar';
import KPIGrid from '../../components/KPIGrid/KPIGrid';
import ChartCard from '../../components/ChartCard/ChartCard';
import SpecSummary from '../../components/SpecSummary/SpecSummary';
import DataTable from '../../components/DataTable/DataTable';

import { useAuth } from '../../hooks/useAuth';
import { useProductionData } from '../../contexts/DataContext';
import { useFilters } from '../../hooks/useFilters';

import { calcMetrics, getSortedPeriods } from '../../utils/calculations';
import { specOf, pKey } from '../../utils/csvParser';
import { fmt, fmtK } from '../../utils/formatters';

import './DashboardPage.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, PointElement, LineElement
);

const CHART_OPTS_BAR = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: ctx => ' ' + fmt(ctx.raw) } }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: {
      grid: { color: '#e8f0f7' },
      ticks: { callback: v => 'R$' + v.toLocaleString('pt-BR'), font: { size: 11 } }
    }
  }
};

const CHART_OPTS_DONUT = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: '62%',
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 14, boxWidth: 14 } },
    tooltip: { callbacks: { label: ctx => ' ' + fmt(ctx.raw) } }
  }
};

const CHART_OPTS_HBAR = {
  ...CHART_OPTS_BAR,
  indexAxis: 'y',
  scales: {
    x: {
      grid: { color: '#e8f0f7' },
      ticks: { callback: v => 'R$' + v.toLocaleString('pt-BR'), font: { size: 11 } }
    },
    y: { grid: { display: false }, ticks: { font: { size: 11 } } }
  }
};

const UNIT_COLORS = ['#0a4f7f', '#00b4d8', '#2ec4b6', '#48cae4', '#90e0ef', '#ade8f4'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { rawData, loading: dataLoading, error: dataError, lastUpdated, loadData, status, statusColor } = useProductionData();
  const { filters, setters, options, filteredData, specCounts, setDefaults, clearFilters } = useFilters(rawData, user?.units);
  const [activeTab, setActiveTab] = useState('geral');
  const didSetDefaults = useRef(false);

  // Set default filters after first load
  useEffect(() => {
    if (rawData.length > 0 && !didSetDefaults.current) {
      setDefaults();
      didSetDefaults.current = true;
    }
  }, [rawData, setDefaults]);

  const handleSync = useCallback(async () => {
    try { await loadData(); } catch { /* error handled by context */ }
  }, [loadData]);

  // Split data by specialty
  const cliData = filteredData.filter(r => specOf(r) === 'clinico');
  const ortData = filteredData.filter(r => specOf(r) === 'ortho');
  const allM = calcMetrics(filteredData);
  const cliM = calcMetrics(cliData);
  const ortM = calcMetrics(ortData);

  // General KPIs
  const geralKPIs = [
    { label: 'Produção Total', value: fmtK(allM.prod), subtitle: 'Todas especialidades', color: 'blue' },
    { label: 'Prod. / Atendimento', value: fmtK(allM.pa), subtitle: 'Ticket médio', color: 'orange' },
    { label: 'Prod. / Hora', value: fmtK(allM.ph), subtitle: 'Eficiência horária', color: 'green' },
    { label: 'Prod. / Dia', value: fmtK(allM.pd), subtitle: 'Média por dia trabalhado', color: 'indigo' },
    { label: 'Atendimentos', value: allM.atend.toLocaleString('pt-BR'), subtitle: 'Total', color: 'teal' },
    { label: 'Horas Trabalhadas', value: allM.horas.toLocaleString('pt-BR') + 'h', subtitle: 'Total acumulado', color: 'rose' },
    { label: 'Unidades', value: String(allM.units.filter(Boolean).length), subtitle: 'Com produção', color: 'red' }
  ];

  const makeKPIs = (m, prefix) => [
    { label: 'Produção Total', value: fmtK(m.prod), subtitle: `${prefix} no período`, color: prefix === 'Clínicos' ? 'blue' : 'purple' },
    { label: 'Prod. / Atendimento', value: fmtK(m.pa), subtitle: 'Ticket médio', color: 'orange' },
    { label: 'Prod. / Hora', value: fmtK(m.ph), subtitle: 'Eficiência horária', color: 'green' },
    { label: 'Prod. / Dia', value: fmtK(m.pd), subtitle: 'Média / dia', color: 'indigo' },
    { label: 'Atendimentos', value: m.atend.toLocaleString('pt-BR'), subtitle: 'Total', color: 'teal' },
    { label: 'Horas Trabalhadas', value: m.horas.toLocaleString('pt-BR') + 'h', subtitle: 'Total acumulado', color: 'rose' }
  ];

  // Chart data — monthly production
  const periods = getSortedPeriods(filteredData, pKey);
  const prodByPeriod = {};
  filteredData.forEach(r => { prodByPeriod[r.periodo] = (prodByPeriod[r.periodo] || 0) + r.prod; });

  const cliPeriods = getSortedPeriods(cliData, pKey);
  const cliByPeriod = {};
  cliData.forEach(r => { cliByPeriod[r.periodo] = (cliByPeriod[r.periodo] || 0) + r.prod; });

  const ortPeriods = getSortedPeriods(ortData, pKey);
  const ortByPeriod = {};
  ortData.forEach(r => { ortByPeriod[r.periodo] = (ortByPeriod[r.periodo] || 0) + r.prod; });

  // Unit average chart
  const byUnit = {};
  filteredData.forEach(r => { if (r.unit) byUnit[r.unit] = (byUnit[r.unit] || 0) + r.prod; });
  const nMon = periods.length || 1;
  const unitSorted = Object.entries(byUnit).map(([u, v]) => [u, v / nMon]).sort((a, b) => b[1] - a[1]);

  // Donut — dentist participation per spec
  const buildDentistDonut = (data, colors) => {
    const byDent = {};
    data.forEach(r => { byDent[r.dentist] = (byDent[r.dentist] || 0) + r.prod; });
    const sorted = Object.entries(byDent).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      labels: sorted.map(([d]) => d),
      datasets: [{
        data: sorted.map(([, v]) => v),
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#fff'
      }]
    };
  };

  const CLI_COLORS = ['#0a4f7f', '#1d9bd1', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8', '#023e8a', '#0077b6'];
  const ORT_COLORS = ['#6b21a8', '#9333ea', '#c084fc', '#d8b4fe', '#ede9fe', '#7c3aed', '#4c1d95', '#a855f7'];

  return (
    <div className="dashboard-page">
      <Header status={status} statusColor={statusColor} lastUpdated={lastUpdated} />

      <div className="tabs-bar">
        <button
          className={`tab-btn tab-geral${activeTab === 'geral' ? ' active' : ''}`}
          onClick={() => setActiveTab('geral')}
        >
          📊 Geral
        </button>
        <button
          className={`tab-btn tab-clinico${activeTab === 'clinico' ? ' active' : ''}`}
          onClick={() => setActiveTab('clinico')}
        >
          🩺 Clínico <span className="tab-pill">{specCounts.clinico}</span>
        </button>
        <button
          className={`tab-btn tab-ortho${activeTab === 'ortho' ? ' active' : ''}`}
          onClick={() => setActiveTab('ortho')}
        >
          😁 Ortodontia <span className="tab-pill">{specCounts.ortho}</span>
        </button>
      </div>

      <main className="dashboard-main">
        <SyncPanel loading={dataLoading} error={dataError} onSync={handleSync} />

        {rawData.length > 0 && (
          <FilterBar filters={filters} setters={setters} options={options} onClear={clearFilters} />
        )}

        {/* ═══ TAB GERAL ═══ */}
        <div className={`tab-content${activeTab === 'geral' ? ' active' : ''}`}>
          <KPIGrid items={geralKPIs} />

          <div className="section-title">Comparativo por Especialidade</div>
          <SpecSummary clinicoMetrics={cliM} orthoMetrics={ortM} />

          <div className="chart-grid">
            <ChartCard title="Evolução Mensal da Produção" subtitle="Produção total unificada">
              <Bar
                height={250}
                data={{
                  labels: periods,
                  datasets: [{ label: 'Produção Total', data: periods.map(p => prodByPeriod[p] || 0), backgroundColor: 'rgba(10,79,127,0.85)', borderRadius: 5 }]
                }}
                options={CHART_OPTS_BAR}
              />
            </ChartCard>
            <ChartCard title="Participação por Especialidade" subtitle="% da produção total">
              <Doughnut
                height={250}
                data={{
                  labels: ['Clínico', 'Ortodontia'],
                  datasets: [{ data: [cliM.prod, ortM.prod], backgroundColor: ['#0a4f7f', '#6b21a8'], borderWidth: 3, borderColor: '#fff' }]
                }}
                options={CHART_OPTS_DONUT}
              />
            </ChartCard>
            <ChartCard title="Média Mensal por Unidade" subtitle="Comparativo de média mensal entre clínicas" className="chart-grid-full">
              <Bar
                height={160}
                data={{
                  labels: unitSorted.map(e => e[0]),
                  datasets: [{ data: unitSorted.map(e => e[1]), backgroundColor: unitSorted.map((_, i) => UNIT_COLORS[i % UNIT_COLORS.length]), borderRadius: 7, borderSkipped: false }]
                }}
                options={CHART_OPTS_HBAR}
              />
            </ChartCard>
          </div>

          <DataTable title="Ranking por Unidade" subtitle="Todas as clínicas — ordenado por produção" data={filteredData} barClass="bar-general" groupKey="unit" />
        </div>

        {/* ═══ TAB CLÍNICO ═══ */}
        <div className={`tab-content${activeTab === 'clinico' ? ' active' : ''}`}>
          <div className="spec-header">
            <span className="badge badge-clinico" style={{ fontSize: 13, padding: '4px 13px' }}>🩺 Clínico</span>
            <span className="spec-header-sub">Análise detalhada dos dentistas clínicos</span>
          </div>
          <KPIGrid items={makeKPIs(cliM, 'Clínicos')} />
          <div className="chart-grid">
            <ChartCard title="Evolução Mensal — Clínico" subtitle="Produção total por período">
              <Bar
                height={230}
                data={{
                  labels: cliPeriods,
                  datasets: [{ label: 'Clínico', data: cliPeriods.map(p => cliByPeriod[p] || 0), backgroundColor: 'rgba(10,79,127,0.85)', borderRadius: 5 }]
                }}
                options={CHART_OPTS_BAR}
              />
            </ChartCard>
            <ChartCard title="Distribuição por Dentista" subtitle="% de participação">
              <Doughnut height={230} data={buildDentistDonut(cliData, CLI_COLORS)} options={CHART_OPTS_DONUT} />
            </ChartCard>
          </div>
          <DataTable title="Ranking — Clínico" subtitle="Ordenado por produção" data={cliData} barClass="bar-clinico" groupKey="dentist" />
        </div>

        {/* ═══ TAB ORTODONTIA ═══ */}
        <div className={`tab-content${activeTab === 'ortho' ? ' active' : ''}`}>
          <div className="spec-header">
            <span className="badge badge-ortho" style={{ fontSize: 13, padding: '4px 13px' }}>😁 Ortodontia</span>
            <span className="spec-header-sub">Análise detalhada dos ortodontistas</span>
          </div>
          <KPIGrid items={makeKPIs(ortM, 'Ortodontistas')} />
          <div className="chart-grid">
            <ChartCard title="Evolução Mensal — Ortodontia" subtitle="Produção total por período">
              <Bar
                height={230}
                data={{
                  labels: ortPeriods,
                  datasets: [{ label: 'Ortodontia', data: ortPeriods.map(p => ortByPeriod[p] || 0), backgroundColor: 'rgba(107,33,168,0.85)', borderRadius: 5 }]
                }}
                options={CHART_OPTS_BAR}
              />
            </ChartCard>
            <ChartCard title="Distribuição por Dentista" subtitle="% de participação">
              <Doughnut height={230} data={buildDentistDonut(ortData, ORT_COLORS)} options={CHART_OPTS_DONUT} />
            </ChartCard>
          </div>
          <DataTable title="Ranking — Ortodontia" subtitle="Ordenado por produção" data={ortData} barClass="bar-ortho" groupKey="dentist" />
        </div>
      </main>
    </div>
  );
}
