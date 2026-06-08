import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/Header/Header';
import * as userService from '../../services/userService';
import * as authService from '../../services/authService';
import './UsersPage.css';

export default function UsersPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // New user form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUnits, setNewUnits] = useState('');
  const [registerMsg, setRegisterMsg] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Change admin password form
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setRegisterMsg({ type: 'error', text: 'Usuário e senha são obrigatórios' });
      return;
    }
    setRegisterLoading(true);
    setRegisterMsg(null);
    try {
      const units = newUnits.split(',').map(u => u.trim()).filter(Boolean);
      await authService.register(newUsername, newPassword, units);
      setRegisterMsg({ type: 'success', text: `Usuário "${newUsername}" cadastrado com sucesso!` });
      setNewUsername('');
      setNewPassword('');
      setNewUnits('');
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao cadastrar usuário';
      setRegisterMsg({ type: 'error', text: msg });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Excluir o usuário "${username}"?`)) return;
    try {
      await userService.deleteUser(username);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  const handleChangeOtherPassword = async (targetUsername) => {
    const newPassword = window.prompt(`Nova senha para "${targetUsername}":`);
    if (!newPassword) return;
    try {
      await userService.changePassword({ targetUsername, newPassword });
      alert('Senha alterada com sucesso!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar senha');
    }
  };

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    if (!oldPass || !newPass) {
      setPassMsg({ type: 'error', text: 'Preencha todos os campos' });
      return;
    }
    setPassLoading(true);
    setPassMsg(null);
    try {
      await userService.changePassword({
        targetUsername: user.username,
        newPassword: newPass,
        oldPassword: oldPass
      });
      setPassMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setOldPass('');
      setNewPass('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao alterar senha';
      setPassMsg({ type: 'error', text: msg });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="users-page">
      <Header />

      <main className="users-main">
        <div className="users-header-section">
          <div>
            <h1>Gerenciar Usuários</h1>
            <p>Cadastre novos usuários e defina quais unidades eles podem acessar.</p>
          </div>
          <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => navigate('/')}>
            ← Voltar
          </button>
        </div>

        {/* Register user */}
        <div className="users-card">
          <h2>Novo Usuário</h2>
          <form onSubmit={handleRegister}>
            <div className="users-form-grid">
              <div>
                <label htmlFor="new-username">Nome de usuário</label>
                <input
                  id="new-username"
                  type="text"
                  placeholder="Nome de usuário"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="new-password">Senha</label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Senha"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="users-form-full">
                <label htmlFor="new-units">Unidades (separadas por vírgula)</label>
                <input
                  id="new-units"
                  type="text"
                  placeholder="Ex: Unidade 1, Unidade 2"
                  value={newUnits}
                  onChange={e => setNewUnits(e.target.value)}
                />
              </div>
            </div>
            <button className="btn" type="submit" disabled={registerLoading}>
              {registerLoading ? <><span className="spinner spinner-sm" /> Cadastrando...</> : '+ Cadastrar Usuário'}
            </button>
            {registerMsg && (
              <div className={registerMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                {registerMsg.type === 'success' ? '✅' : '⚠️'} {registerMsg.text}
              </div>
            )}
          </form>
        </div>

        {/* Change admin password */}
        <div className="users-card">
          <h2>Alterar Minha Senha</h2>
          <form onSubmit={handleChangeAdminPassword}>
            <div className="users-form-grid">
              <div>
                <label htmlFor="old-pass">Senha Atual</label>
                <input
                  id="old-pass"
                  type="password"
                  placeholder="Senha atual"
                  value={oldPass}
                  onChange={e => setOldPass(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="new-pass">Nova Senha</label>
                <input
                  id="new-pass"
                  type="password"
                  placeholder="Nova senha"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                />
              </div>
            </div>
            <button className="btn" type="submit" disabled={passLoading}>
              {passLoading ? <><span className="spinner spinner-sm" /> Alterando...</> : 'Alterar Senha'}
            </button>
            {passMsg && (
              <div className={passMsg.type === 'success' ? 'success-msg' : 'error-msg'}>
                {passMsg.type === 'success' ? '✅' : '⚠️'} {passMsg.text}
              </div>
            )}
          </form>
        </div>

        {/* User list */}
        <div className="users-card">
          <h2>Usuários Cadastrados</h2>
          {loadingUsers ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--muted)', fontSize: 13 }}>
              <span className="spinner" /> Carregando...
            </div>
          ) : (
            <ul className="user-list">
              {users.map(u => (
                <li key={u.username} className="user-list-item">
                  <div className="user-list-item-info">
                    <div>
                      <span className="user-list-item-username">{u.username}</span>
                      <span className="user-list-item-role">{u.role}</span>
                    </div>
                    <div className="user-list-item-units">
                      {u.units?.length > 0 ? u.units.join(', ') : '— Todas as unidades'}
                    </div>
                  </div>
                  <div className="user-list-item-actions">
                    {u.username !== 'admin' && (
                      <>
                        <button
                          className="btn btn-ghost"
                          onClick={() => handleChangeOtherPassword(u.username)}
                          style={{ fontSize: 12, padding: '6px 12px' }}
                        >
                          🔑 Senha
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(u.username)}
                          style={{ fontSize: 12, padding: '6px 12px' }}
                        >
                          🗑 Excluir
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
