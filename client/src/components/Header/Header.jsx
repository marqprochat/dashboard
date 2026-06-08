import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProductionData } from '../../contexts/DataContext';
import './Header.css';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { status, statusColor, lastUpdated } = useProductionData();
  const navigate = useNavigate();

  return (
    <header className="header">
      <a href="/" className="header-logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
        <img src="/logo.png" alt="Dentalkids Logo" className="header-logo-icon" />
        <div>
          <div className="header-logo-text">Dentalkids</div>
          <div className="header-logo-sub">Dashboard de Produção</div>
        </div>
      </a>

      <div className="header-right">
        {lastUpdated && (
          <span className="header-updated">
            Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
        )}

        <div className="header-status">
          <span
            className="header-status-dot"
            style={{ background: statusColor || '#94a3b8' }}
          />
          <span>{status || 'Aguardando dados'}</span>
        </div>

        <button className="btn btn-ghost" onClick={() => navigate('/teste')}>
          Teste API
        </button>

        {isAdmin && (
          <button className="btn btn-ghost" onClick={() => navigate('/users')}>
            Usuários
          </button>
        )}

        <button className="btn btn-ghost" onClick={logout}>
          Sair
        </button>
      </div>
    </header>
  );
}
