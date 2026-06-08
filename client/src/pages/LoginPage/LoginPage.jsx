import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Preencha usuário e senha');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Usuário ou senha incorretos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin(e);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="/logo.png" alt="Dentalkids" className="login-logo" />
          <div className="login-title">Dentalkids</div>
          <div className="login-subtitle">Dashboard de Produção</div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-input-group">
            <label htmlFor="login-username">Usuário</label>
            <input
              id="login-username"
              className="login-input"
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Entrando...</> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
