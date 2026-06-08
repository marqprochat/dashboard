import api from './api';

export async function getAllUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function deleteUser(username) {
  const response = await api.delete(`/users/${username}`);
  return response.data;
}

export async function changePassword({ targetUsername, newPassword, oldPassword }) {
  const response = await api.post('/users/change-password', {
    targetUsername,
    newPassword,
    oldPassword
  });
  return response.data;
}
