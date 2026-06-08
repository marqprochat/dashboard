/**
 * Format a number as Brazilian Real currency
 */
export function fmt(v) {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format as compact currency (e.g., R$1,2 k)
 */
export function fmtK(v) {
  if (v >= 1000) {
    return 'R$' + (v / 1000).toFixed(1).replace('.', ',') + ' k';
  }
  return fmt(v);
}

/**
 * Format number with locale
 */
export function formatNumber(v) {
  return v.toLocaleString('pt-BR');
}
