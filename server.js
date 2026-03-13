const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);

// Create users table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    units TEXT
  )`);

  // Insert default admin if not exists
  db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (username, password, units) VALUES ('admin', 'admin', '[]')");
    }
  });
});

// Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
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
});

app.post('/api/register', (req, res) => {
  const { username, password, units } = req.body;
  db.run("INSERT INTO users (username, password, units) VALUES (?, ?, ?)", [username, password, JSON.stringify(units)], function(err) {
    if (err) {
      return res.status(400).json({ error: 'User already exists or error: ' + err.message });
    }
    res.json({ success: true });
  });
});

app.get('/api/users', (req, res) => {
  db.all("SELECT username, units FROM users", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => ({ username: row.username, units: JSON.parse(row.units) })));
  });
});

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});