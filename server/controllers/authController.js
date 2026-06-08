const dbService = require('../services/databaseService');
const { generateToken } = require('../middleware/authMiddleware');

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const user = await dbService.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const isValid = await dbService.verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        units: JSON.parse(user.units || '[]')
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { username, password, units } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const existing = await dbService.findUserByUsername(username);
    if (existing) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const user = await dbService.createUser(username, password, units || []);

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        units: user.units
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
}

/**
 * GET /api/auth/me — returns current user from token
 */
async function me(req, res) {
  try {
    const user = await dbService.findUserByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      units: JSON.parse(user.units || '[]')
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { login, register, me };
