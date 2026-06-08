import api from './api';

export async function login(username, password) {
  const response = await api.post('/auth/login', { username, password });
  const { token, user } = response.data;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  return { token, user };
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export async function register(username, password, units) {
  const response = await api.post('/auth/register', { username, password, units });
  return response.data;
}

export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}

export function getStoredUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function getStoredToken() {
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return !!getStoredToken();
}
