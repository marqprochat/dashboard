const db = require('../config/database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Initialize the database schema and default admin user
 */
function initialize() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          units TEXT DEFAULT '[]',
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return reject(err);

        // Check if admin exists
        db.get("SELECT * FROM users WHERE username = 'admin'", async (err, row) => {
          if (err) return reject(err);

          if (!row) {
            const hashedPassword = await bcrypt.hash('admin', SALT_ROUNDS);
            db.run(
              "INSERT INTO users (username, password, units, role) VALUES (?, ?, ?, ?)",
              ['admin', hashedPassword, '[]', 'admin'],
              (err) => {
                if (err) return reject(err);
                console.log('✅ Usuário admin padrão criado');
                resolve();
              }
            );
          } else {
            resolve();
          }
        });
      });
    });
  });
}

/**
 * Find a user by username
 */
function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * Create a new user
 */
async function createUser(username, password, units = [], role = 'user') {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password, units, role) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, JSON.stringify(units), role],
      function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, username, units, role });
      }
    );
  });
}

/**
 * Get all users (without passwords)
 */
function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, username, units, role, created_at FROM users", (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(row => ({
        ...row,
        units: JSON.parse(row.units || '[]')
      })));
    });
  });
}

/**
 * Delete a user by username
 */
function deleteUser(username) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM users WHERE username = ?", [username], function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

/**
 * Update user password
 */
async function updatePassword(username, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET password = ? WHERE username = ?",
      [hashedPassword, username],
      function (err) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      }
    );
  });
}

/**
 * Verify a user's password
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  initialize,
  findUserByUsername,
  createUser,
  getAllUsers,
  deleteUser,
  updatePassword,
  verifyPassword
};
