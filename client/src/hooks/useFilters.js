import { useState, useCallback, useMemo } from 'react';
import { specOf, pKey, parsePeriodo, MONTH_NAMES } from '../utils/csvParser';

export function useFilters(rawData, userUnits = []) {
  const [spec, setSpec] = useState('');
  const [unit, setUnit] = useState('');
  const [dentist, setDentist] = useState('');
  const [monthStart, setMonthStart] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [monthEnd, setMonthEnd] = useState('');
  const [yearEnd, setYearEnd] = useState('');

  // Filter by user units first
  const userFilteredData = useMemo(() => {
    if (!userUnits || userUnits.length === 0) return rawData;
    return rawData.filter(r => userUnits.includes(r.unit));
  }, [rawData, userUnits]);

  // Available filter options
  const options = useMemo(() => {
    const units = [...new Set(userFilteredData.map(r => r.unit).filter(Boolean))].sort();
    const dentists = [...new Set(userFilteredData.map(r => r.dentist))].sort();
    const months = [...new Set(userFilteredData.map(r => parsePeriodo(r.periodo).mes).filter(m => m > 0))].sort((a, b) => a - b);
    const years = [...new Set(userFilteredData.map(r => parsePeriodo(r.periodo).ano).filter(y => y > 0))].sort((a, b) => a - b);

    return {
      units: units.map(v => ({ value: v, label: v })),
      dentists: dentists.map(v => ({ value: v, label: v })),
      months: months.map(m => ({ value: String(m), label: MONTH_NAMES[m] })),
      years: years.map(y => ({ value: String(y), label: String(y) }))
    };
  }, [userFilteredData]);

  // Filtered data
  const filteredData = useMemo(() => {
    const startKey = (yearStart || monthStart)
      ? `${yearStart || '0000'}-${(monthStart || '1').padStart(2, '0')}`
      : '';
    const endKey = (yearEnd || monthEnd)
      ? `${yearEnd || '9999'}-${(monthEnd || '12').padStart(2, '0')}`
      : '';

    return userFilteredData.filter(r => {
      if (spec && specOf(r) !== spec) return false;
      if (unit && r.unit !== unit) return false;
      if (dentist && r.dentist !== dentist) return false;
      if (startKey || endKey) {
        const k = pKey(r.periodo);
        if (startKey && k < startKey) return false;
        if (endKey && k > endKey) return false;
      }
      return true;
    });
  }, [userFilteredData, spec, unit, dentist, monthStart, yearStart, monthEnd, yearEnd]);

  // Specialty counts
  const specCounts = useMemo(() => ({
    clinico: new Set(userFilteredData.filter(r => specOf(r) === 'clinico').map(r => r.dentist)).size,
    ortho: new Set(userFilteredData.filter(r => specOf(r) === 'ortho').map(r => r.dentist)).size
  }), [userFilteredData]);

  const setDefaults = useCallback(() => {
    const nowMonth = String(new Date().getMonth() + 1);
    const nowYear = String(new Date().getFullYear());
    const availableMonths = options.months.map(m => m.value);
    const availableYears = options.years.map(y => y.value);

    if (availableMonths.includes(nowMonth)) {
      setMonthStart(nowMonth);
      setMonthEnd(nowMonth);
    }
    if (availableYears.includes(nowYear)) {
      setYearStart(nowYear);
      setYearEnd(nowYear);
    }
  }, [options]);

  const clearFilters = useCallback(() => {
    setSpec('');
    setUnit('');
    setDentist('');
    setMonthStart('');
    setYearStart('');
    setMonthEnd('');
    setYearEnd('');
  }, []);

  return {
    filters: { spec, unit, dentist, monthStart, yearStart, monthEnd, yearEnd },
    setters: { setSpec, setUnit, setDentist, setMonthStart, setYearStart, setMonthEnd, setYearEnd },
    options,
    filteredData,
    specCounts,
    setDefaults,
    clearFilters
  };
}
