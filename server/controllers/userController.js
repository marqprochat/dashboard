const dbService = require('../services/databaseService');

/**
 * GET /api/users
 */
async function getAll(req, res) {
  try {
    const users = await dbService.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}

/**
 * DELETE /api/users/:username
 */
async function deleteUser(req, res) {
  try {
    const { username } = req.params;

    if (username === 'admin') {
      return res.status(400).json({ error: 'Não é possível excluir o usuário admin' });
    }

    const result = await dbService.deleteUser(username);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
}

/**
 * POST /api/users/change-password
 */
async function changePassword(req, res) {
  try {
    const { targetUsername, newPassword, oldPassword } = req.body;
    const currentUser = req.user;

    if (!targetUsername || !newPassword) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    // If changing own password, verify old password
    if (currentUser.username === targetUsername) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'Senha atual é obrigatória para alterar sua própria senha' });
      }

      const user = await dbService.findUserByUsername(currentUser.username);
      const isValid = await dbService.verifyPassword(oldPassword, user.password);

      if (!isValid) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }
    } else {
      // Only admin can change other users' passwords
      if (currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Apenas o admin pode alterar senhas de outros usuários' });
      }
    }

    const result = await dbService.updatePassword(targetUsername, newPassword);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
}

module.exports = { getAll, deleteUser, changePassword };
