import { useState, useCallback } from 'react';
import { fetchProduction } from '../services/dataService';

export function useData() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProduction();
      setRawData(data);
      setLastUpdated(new Date());
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    rawData,
    loading,
    error,
    lastUpdated,
    loadData
  };
}
