/**
 * Calculate aggregate metrics from an array of data rows
 */
export function calcMetrics(data) {
  const prod = data.reduce((s, r) => s + r.prod, 0);
  const atend = data.reduce((s, r) => s + r.atend, 0);
  const horas = data.reduce((s, r) => s + r.horas, 0);
  const pdW = data.reduce((s, r) => s + (r.pdia * r.prod), 0);

  return {
    prod,
    atend,
    horas,
    pa: atend > 0 ? prod / atend : 0,
    ph: horas > 0 ? prod / horas : 0,
    pd: prod > 0 ? pdW / prod : 0,
    dents: [...new Set(data.map(r => r.dentist))],
    units: [...new Set(data.map(r => r.unit))]
  };
}

/**
 * Group data by a key and aggregate production
 */
export function groupByKey(data, key) {
  const groups = {};
  data.forEach(r => {
    const k = r[key] || 'N/A';
    if (!groups[k]) groups[k] = { prod: 0, atend: 0, horas: 0, pdW: 0, dentists: new Set() };
    groups[k].prod += r.prod;
    groups[k].atend += r.atend;
    groups[k].horas += r.horas;
    groups[k].pdW += r.pdia * r.prod;
    if (r.dentist) groups[k].dentists.add(r.dentist);
  });
  return groups;
}

/**
 * Get sorted unique periods
 */
export function getSortedPeriods(data, pKeyFn) {
  return [...new Set(data.map(r => r.periodo))]
    .sort((a, b) => pKeyFn(a).localeCompare(pKeyFn(b)));
}
