import './SyncPanel.css';

export default function SyncPanel({ loading, error, onSync }) {
  return (
    <div className="sync-panel">
      <div className="sync-panel-info">
        <div className="sync-panel-icon">📊</div>
        <div className="sync-panel-text">
          <h3>Dados de Produção</h3>
          <p>Clique no botão para buscar os dados atualizados da planilha</p>
        </div>
      </div>

      <button
        className="sync-panel-btn"
        onClick={onSync}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="sync-spinner" />
            Carregando...
          </>
        ) : (
          '🔄 Atualizar Dados'
        )}
      </button>

      {error && (
        <div className="sync-error">
          <strong>⚠️ Não foi possível carregar a planilha.</strong><br /><br />
          Detalhe do erro: {error}<br /><br />
          <strong>Verifique:</strong>
          <ul>
            <li>A planilha está acessível para <strong>"Qualquer pessoa com o link"</strong>?</li>
            <li>Verifique sua conexão com a internet.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
