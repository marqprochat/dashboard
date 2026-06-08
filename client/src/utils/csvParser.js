const MMAP = {
  jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
  jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12
};

export const MONTH_NAMES = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Normalize a string for comparison (lowercase, no accents, no quotes)
 */
export function norm(s) {
  return String(s || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/["\u201C\u201D]/g, '');
}

/**
 * Parse "05/2026", "Jan/2025" → { mes, ano }
 */
export function parsePeriodo(p) {
  const s = String(p || '').trim();

  const numMatch = s.match(/^(\d{1,2})[/\-.](\d{4})$/);
  if (numMatch) {
    return { mes: parseInt(numMatch[1], 10), ano: parseInt(numMatch[2], 10) };
  }

  const nameMatch = s.match(/^([a-zA-Zç]+)[/\-. ](\d{4})/);
  if (nameMatch) {
    const m = MMAP[nameMatch[1].toLowerCase().slice(0, 3)] || 0;
    return { mes: m, ano: parseInt(nameMatch[2], 10) };
  }

  return { mes: 0, ano: 0 };
}

/**
 * Get a sortable period key "YYYY-MM"
 */
export function pKey(p) {
  const { mes, ano } = parsePeriodo(p);
  if (!ano) return p;
  return `${ano}-${String(mes).padStart(2, '0')}`;
}

/**
 * Determine specialty from a row
 */
export function specOf(r) {
  const s = norm(r.specialty || '');
  return s.includes('orto') ? 'ortho' : 'clinico';
}

/**
 * Parse CSV text from Google Sheets into structured data
 */
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',').map(norm);
  const cm = {};

  headers.forEach((h, i) => {
    if (h.includes('period') || h === 'periodo') cm.periodo = i;
    else if (['dentista', 'dentist', 'profissional'].includes(h)) cm.dentist = i;
    else if (h.includes('unidade') || h.includes('unit') || h.includes('clinica') || h.includes('filial')) cm.unit = i;
    else if (h === 'atendimento' || h === 'atendimentos') cm.atend = i;
    else if (h.includes('producao') && h.includes('hora')) cm.phora = i;
    else if (h.includes('producao') && h.includes('dia')) cm.pdia = i;
    else if (h.includes('producao') && h.includes('atend')) cm.pa = i;
    else if (h === 'producao' || h === 'producao total' || h === 'producao (r$)') cm.prod = i;
    else if (h.includes('hora') && h.includes('trabalhada')) cm.horas = i;
    else if (h.includes('especialidade') || h.includes('specialty')) cm.specialty = i;
  });

  if (cm.prod === undefined) {
    cm.prod = headers.findIndex(h => h.includes('producao') && !h.includes('/')) || 4;
  }
  if (cm.horas === undefined) cm.horas = 6;

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row.trim()) continue;

    // Handle quoted fields with commas
    const cols = [];
    let cur = '';
    let inQ = false;
    for (const ch of row) {
      if (ch === '"' || ch === '\u201C' || ch === '\u201D') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());

    if (cols.length < 3) continue;

    const toNum = (idx) => {
      if (idx === undefined || idx >= cols.length) return 0;
      const v = (cols[idx] || '0').replace(/[R$\s.]/g, '').replace(',', '.');
      return parseFloat(v) || 0;
    };

    const prod = toNum(cm.prod);
    if (!prod && i > 1) continue;

    const atend = toNum(cm.atend) || 1;
    const horas = toNum(cm.horas);
    const pa = toNum(cm.pa) || Math.round(prod / atend);
    const phora = toNum(cm.phora) || (horas > 0 ? Math.round(prod / horas) : 0);
    const pdia = toNum(cm.pdia) || 0;

    result.push({
      periodo: (cols[cm.periodo] || '').trim(),
      dentist: (cols[cm.dentist] || '?').trim(),
      unit: (cols[cm.unit] || '').trim(),
      atend, prod, pa, horas, phora, pdia,
      specialty: (cols[cm.specialty] || '').trim()
    });
  }

  return result;
}
