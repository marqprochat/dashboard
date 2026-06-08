import { createContext, useState, useCallback, useContext } from 'react';
import { fetchProduction } from '../services/dataService';

export const DataContext = createContext(null);

export function DataProvider({ children }) {
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

  // Determine global status for the header
  let status = 'Aguardando dados';
  let statusColor = '#94a3b8';

  if (loading) {
    status = 'Carregando...';
    statusColor = '#fbbf24';
  } else if (error) {
    status = 'Erro de acesso';
    statusColor = '#ef4444';
  } else if (rawData.length > 0) {
    status = 'Conectado';
    statusColor = '#6ee7b7';
  }

  return (
    <DataContext.Provider value={{
      rawData,
      loading,
      error,
      lastUpdated,
      status,
      statusColor,
      loadData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useProductionData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useProductionData must be used within a DataProvider');
  }
  return context;
}
