import { parseCSV } from '../utils/csvParser';

const SHEET_ID = '1BDyHqn0J90HPmJiCHHawYS4IxfH8dhe8x5YMQO_EGMI';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

/**
 * Fetch production data from Google Sheets CSV
 */
export async function fetchProduction() {
  const response = await fetch(SHEET_CSV_URL);

  if (!response.ok) {
    throw new Error('Erro na rede ou link inválido.');
  }

  const text = await response.text();

  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error("Planilha privada! Altere o acesso para 'Qualquer pessoa com o link'.");
  }

  return parseCSV(text);
}
