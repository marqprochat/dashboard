import { useState } from 'react';
import Header from '../../components/Header/Header';
import './TestPage.css';

export default function TestPage() {
  const [formData, setFormData] = useState({
    clientId: '5C9KnPvhhmQh',
    dt_inicio: '2026-01-01',
    dt_termino: '2026-01-31',
    nm_unidade: '',
    nm_prestador: '',
    cpf: ''
  });

  const [results, setResults] = useState({
    agendamentos: null,
    kpi: null,
    prestador: null,
    unidades: null
  });

  const [loading, setLoading] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const makeRequest = async (endpoint, key) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`http://localhost:3001/api/easydental/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResults(prev => ({ ...prev, [key]: data }));
    } catch (error) {
      setResults(prev => ({ ...prev, [key]: { error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="test-page">
      <Header />
      <main className="test-main">
        <div className="test-container">
          <h1>Página de Teste - EasyDental API</h1>
          
          <div className="form-grid">
            <div className="input-group">
              <label>Client ID</label>
              <input name="clientId" value={formData.clientId} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Data Início</label>
              <input type="date" name="dt_inicio" value={formData.dt_inicio} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Data Término</label>
              <input type="date" name="dt_termino" value={formData.dt_termino} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Unidade</label>
              <input name="nm_unidade" value={formData.nm_unidade} onChange={handleChange} placeholder="Opcional" />
            </div>
            <div className="input-group">
              <label>Prestador (Nome)</label>
              <input name="nm_prestador" value={formData.nm_prestador} onChange={handleChange} placeholder="Opcional" />
            </div>
            <div className="input-group">
              <label>CPF</label>
              <input name="cpf" value={formData.cpf} onChange={handleChange} placeholder="999.999.999-99" />
            </div>
          </div>

          <hr className="test-divider" />

          {/* RPCGetAgendamentos */}
          <section className="test-section">
            <div className="section-header">
              <h2>RPCGetAgendamentos</h2>
              <button 
                onClick={() => makeRequest('agendamentos', 'agendamentos')}
                disabled={loading.agendamentos}
              >
                {loading.agendamentos ? 'Enviando...' : 'Testar Agendamentos'}
              </button>
            </div>
            {results.agendamentos && (
              <pre className="json-result">{JSON.stringify(results.agendamentos, null, 2)}</pre>
            )}
          </section>

          <hr className="test-divider" />

          {/* RPCGetKPIPrd */}
          <section className="test-section">
            <div className="section-header">
              <h2>RPCGetKPIPrd</h2>
              <button 
                onClick={() => makeRequest('kpi-producao', 'kpi')}
                disabled={loading.kpi}
              >
                {loading.kpi ? 'Enviando...' : 'Testar KPI Produção'}
              </button>
            </div>
            {results.kpi && (
              <pre className="json-result">{JSON.stringify(results.kpi, null, 2)}</pre>
            )}
          </section>

          <hr className="test-divider" />

          {/* RPCGetPrestadorCPF */}
          <section className="test-section">
            <div className="section-header">
              <h2>RPCGetPrestadorCPF</h2>
              <button 
                onClick={() => makeRequest('prestador-cpf', 'prestador')}
                disabled={loading.prestador}
              >
                {loading.prestador ? 'Enviando...' : 'Testar Buscar por CPF'}
              </button>
            </div>
            {results.prestador && (
              <pre className="json-result">{JSON.stringify(results.prestador, null, 2)}</pre>
            )}
          </section>

          <hr className="test-divider" />

          {/* RPCGetUnidadeAtendimento */}
          <section className="test-section">
            <div className="section-header">
              <h2>RPCGetUnidadeAtendimento</h2>
              <button 
                onClick={() => makeRequest('unidades', 'unidades')}
                disabled={loading.unidades}
              >
                {loading.unidades ? 'Enviando...' : 'Testar Listar Unidades'}
              </button>
            </div>
            {results.unidades && (
              <pre className="json-result">{JSON.stringify(results.unidades, null, 2)}</pre>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
