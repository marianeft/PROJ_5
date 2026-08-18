import express from 'express';
import session from 'express-session';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ════════════════════════════════════════════════════════
// DATABASE SETUP
// ════════════════════════════════════════════════════════
const db = new sqlite3.Database('./auth.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database');
  initDatabase();
});

function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('✓ Users table ready');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('Error creating sessions table:', err);
    else console.log('✓ Sessions table ready');
  });

  // Create default admin user if none exists
  const adminUsername = 'admin';
  const adminPassword = 'admin123'; // Change this in production!
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  db.get('SELECT * FROM users WHERE username = ?', [adminUsername], (err, row) => {
    if (!row) {
      db.run(`
        INSERT INTO users (username, email, password, full_name, role)
        VALUES (?, ?, ?, ?, ?)
      `, [adminUsername, 'admin@iesis.local', hashedPassword, 'Administrator', 'admin'], (err) => {
        if (err) console.error('Error creating admin user:', err);
        else console.log('✓ Default admin user created (username: admin, password: admin123)');
      });
    }
  });
}

// ════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ════════════════════════════════════════════════════════
// AUTHENTICATION MIDDLEWARE
// ════════════════════════════════════════════════════════
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    // Redirect to login with return URL
    res.redirect(`/login?return=${encodeURIComponent(req.originalUrl)}`);
  }
}

function optionalAuth(req, res, next) {
  // Check if user is authenticated but don't require it
  if (req.session && req.session.userId) {
    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
      if (user) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

// ════════════════════════════════════════════════════════
// AUTHENTICATION ROUTES
// ════════════════════════════════════════════════════════

// Redirect root to index or login
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('/login');
  }
});

// Serve index.html (homepage - protected)
app.get('/index.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login page (public)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// API: Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.fullName = user.full_name;

    // Create JWT token for additional security
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      },
      token: token
    });
  });
});

// API: Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// API: Get current user
app.get('/api/user', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  db.get('SELECT id, username, email, full_name, role FROM users WHERE id = ?', 
    [req.session.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'User not found' });
      }
      res.json(user);
    });
});

// ════════════════════════════════════════════════════════
// PROTECTED PAGE ROUTES (require authentication)
// ════════════════════════════════════════════════════════

// Home/Dashboard
app.get('/home', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/home.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// NSRP Dashboard
app.get('/nsrp', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'nsrp.html'));
});

app.get('/nsrp.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'nsrp.html'));
});

// PESO Services
app.get('/peso-services', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'peso-services.html'));
});

app.get('/peso-services.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'peso-services.html'));
});

// Labor Market Info
app.get('/labor-market', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'labor-market.html'));
});

app.get('/labor-market.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'labor-market.html'));
});

// CDSP Programs
app.get('/cdsp-programs', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cdsp-programs.html'));
});

app.get('/cdsp-programs.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cdsp-programs.html'));
});

// ════════════════════════════════════════════════════════
// 404 HANDLER
// ════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Page not found' });
    }
  });
});

// ════════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   IESIS Portal - Local Development Server      ║
╚════════════════════════════════════════════════╝

✓ Server running at: http://localhost:${PORT}
✓ Database: ./auth.db

📋 Default Credentials:
   Username: admin
   Password: admin123

🔒 Protected Routes:
   - /home (authenticated required)
   - /nsrp
   - /peso-services
   - /labor-market
   - /cdsp-programs

🔓 Public Routes:
   - /login
   - /api/login (POST)
   - /api/logout (POST)

Press Ctrl+C to stop the server
  `);
});
