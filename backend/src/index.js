import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      target_frequency INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS habit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      habit_id INTEGER NOT NULL,
      date DATE NOT NULL,
      completed BOOLEAN DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      date DATE NOT NULL,
      content TEXT NOT NULL,
      sentiment_score REAL,
      ai_feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  tables.forEach((sql) => {
    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  });

  // Insert demo user for development
  db.run(`INSERT OR IGNORE INTO users (id, email, password, name) 
          VALUES (1, 'demo@example.com', 'demo123', 'Demo User')`, (err) => {
    if (err) {
      console.error('Error inserting demo user:', err.message);
    }
  });
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HabitFlow API is running' });
});

// Auth routes (simplified for demo)
app.post('/api/auth/login', (req, res) => {
  // Simplified auth - in production would verify credentials
  const user = {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User'
  };
  res.json({ user, token: 'demo-token' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Habits routes
app.get('/api/habits', (req, res) => {
  const userId = '1'; // Simplified for demo
  db.all('SELECT * FROM habits WHERE user_id = ? AND is_active = 1', [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/habits', (req, res) => {
  try {
    const { name, description, category, target_frequency } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    
    const userId = '1'; // Simplified for demo
    
    db.run(
      'INSERT INTO habits (user_id, name, description, category, target_frequency) VALUES (?, ?, ?, ?, ?)',
      [userId, name, description || null, category, target_frequency || 1],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: err.message });
        } else {
          res.json({ id: this.lastID, message: 'Habit created successfully' });
        }
      }
    );
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Journal routes
app.get('/api/journal', (req, res) => {
  const userId = '1'; // Simplified for demo
  db.all('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC', [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/journal', (req, res) => {
  const { date, content } = req.body;
  const userId = '1'; // Simplified for demo
  
  db.run(
    'INSERT INTO journal_entries (user_id, date, content) VALUES (?, ?, ?)',
    [userId, date, content],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, message: 'Journal entry created successfully' });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
