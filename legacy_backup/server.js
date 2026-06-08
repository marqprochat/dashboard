const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
let db;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  // Create table if not exists
  db.query(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    units TEXT
  )`, (err) => {
    if (err) console.error('Error creating table:', err);
    // Insert default admin
    db.query("SELECT * FROM users WHERE username = 'admin'", (err, res) => {
      if (!res.rows.length) {
        db.query("INSERT INTO users (username, password, units) VALUES ('admin', 'admin', '[]')");
      }
    });
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = process.env.DB_PATH || path.join(__dirname, 'users.db');
  db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      units TEXT
    )`);
    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
      if (!row) {
        db.run("INSERT INTO users (username, password, units) VALUES ('admin', 'admin', '[]')");
      }
    });
  });
}

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (process.env.DATABASE_URL) {
    db.query("SELECT * FROM users WHERE username = $1 AND password = $2", [username, password], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.rows.length > 0) {
        res.json({ success: true, user: { username: result.rows[0].username, units: JSON.parse(result.rows[0].units) } });
      } else {
        res.json({ success: false });
      }
    });
  } else {
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        res.json({ success: true, user: { username: row.username, units: JSON.parse(row.units) } });
      } else {
        res.json({ success: false });
      }
    });
  }
});

app.post('/api/register', (req, res) => {
  const { username, password, units } = req.body;
  if (process.env.DATABASE_URL) {
    db.query("INSERT INTO users (username, password, units) VALUES ($1, $2, $3)", [username, password, JSON.stringify(units)], (err) => {
      if (err) {
        return res.status(400).json({ error: 'User already exists or error: ' + err.message });
      }
      res.json({ success: true });
    });
  } else {
    db.run("INSERT INTO users (username, password, units) VALUES (?, ?, ?)", [username, password, JSON.stringify(units)], function(err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists or error: ' + err.message });
      }
      res.json({ success: true });
    });
  }
});

app.get('/api/users', (req, res) => {
  if (process.env.DATABASE_URL) {
    db.query("SELECT username, units FROM users", (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(result.rows.map(row => ({ username: row.username, units: JSON.parse(row.units) })));
    });
  } else {
    db.all("SELECT username, units FROM users", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows.map(row => ({ username: row.username, units: JSON.parse(row.units) })));
    });
  }
});

app.post('/api/change-password', (req, res) => {
  const { currentUsername, targetUsername, newPassword, oldPassword } = req.body;
  if (!currentUsername || !targetUsername || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (currentUsername === targetUsername) {
    // Changing own password
    if (!oldPassword) {
      return res.status(400).json({ error: 'Old password required for changing own password' });
    }
    // Verify old password
    const verifyQuery = process.env.DATABASE_URL ?
      "SELECT * FROM users WHERE username = $1 AND password = $2" :
      "SELECT * FROM users WHERE username = ? AND password = ?";
    const params = process.env.DATABASE_URL ? [currentUsername, oldPassword] : [currentUsername, oldPassword];
    (process.env.DATABASE_URL ? db.query : db.get).call(db, verifyQuery, params, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!result || (process.env.DATABASE_URL && !result.rows.length)) {
        return res.status(400).json({ error: 'Old password incorrect' });
      }
      // Update password
      updatePassword();
    });
  } else {
    // Changing others' password
    if (currentUsername !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change other users passwords' });
    }
    updatePassword();
  }

  function updatePassword() {
    const updateQuery = process.env.DATABASE_URL ?
      "UPDATE users SET password = $1 WHERE username = $2" :
      "UPDATE users SET password = ? WHERE username = ?";
    const params = process.env.DATABASE_URL ? [newPassword, targetUsername] : [newPassword, targetUsername];
    (process.env.DATABASE_URL ? db.query : db.run).call(db, updateQuery, params, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    });
  }
});

// Delete user endpoint
app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  if (username === 'admin') {
    return res.status(400).json({ error: 'Cannot delete admin user' });
  }
  if (process.env.DATABASE_URL) {
    db.query("DELETE FROM users WHERE username = $1", [username], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true });
    });
  } else {
    db.run("DELETE FROM users WHERE username = ?", [username], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true });
    });
  }
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});