const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'designx_royal_secret_2026';

const { getDB } = require('../db');

// Attempt MySQL connection — fall back to in-memory if not available
let db = null;
getDB().then(conn => { db = conn; });


// In-memory fallback
const memUsers = new Map([
  ['demo@designx.pro', { id: 1, name: 'Demo User', email: 'demo@designx.pro', passwordHash: null, plan: 'FREE' }]
]);

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, plan: user.plan || 'FREE' }, SECRET, { expiresIn: '24h' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6)
      return res.status(400).json({ error: 'Name, valid email and min 6-char password required' });

    const em = email.toLowerCase().trim();

    if (db) {
      const [rows] = await db.execute('SELECT id FROM users WHERE email=?', [em]);
      if (rows.length) return res.status(409).json({ error: 'Email already registered' });
      const hash = await bcrypt.hash(password, 12);
      const [result] = await db.execute('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)', [name, em, hash]);
      await db.execute('INSERT INTO ai_credits (user_id,balance) VALUES (?,5)', [result.insertId]);
      const user = { id: result.insertId, name, email: em, plan: 'FREE' };
      return res.status(201).json({ token: makeToken(user), user });
    }

    // Memory fallback
    if (memUsers.has(em)) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), name, email: em, passwordHash: hash, plan: 'FREE' };
    memUsers.set(em, user);
    const { passwordHash, ...safe } = user;
    res.status(201).json({ token: makeToken(safe), user: safe });
  } catch (e) { res.status(500).json({ error: 'Registration failed: ' + e.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const em = email.toLowerCase().trim();

    // Demo account
    if (em === 'demo@designx.pro' && password === 'demo123') {
      const user = { id: 1, name: 'Demo User', email: em, plan: 'FREE' };
      return res.json({ token: makeToken(user), user });
    }

    if (db) {
      const [rows] = await db.execute('SELECT id,name,email,password_hash,subscription_type AS plan FROM users WHERE email=?', [em]);
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const { password_hash, ...safe } = user;
      return res.json({ token: makeToken(safe), user: safe });
    }

    // Memory fallback
    const user = memUsers.get(em);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const { passwordHash, ...safe } = user;
    res.json({ token: makeToken(safe), user: safe });
  } catch (e) { res.status(500).json({ error: 'Login failed' }); }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    if (db) {
      const [rows] = await db.execute('SELECT id,name,email,subscription_type AS plan,created_at FROM users WHERE id=?', [req.user.id]);
      if (!rows.length) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: rows[0] });
    }
    res.json({ user: req.user });
  } catch { res.status(500).json({ error: 'Error' }); }
});

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(auth.slice(7), SECRET); next(); }
  catch { res.status(401).json({ error: 'Token expired or invalid' }); }
}

module.exports = router;
module.exports.authenticate = authenticate;
