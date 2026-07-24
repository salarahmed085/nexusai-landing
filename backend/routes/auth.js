const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup({ name, email, password }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Enter a valid email';
  if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (!/[A-Z]/.test(password)) errors.password = 'Password needs an uppercase letter';
  else if (!/[0-9]/.test(password)) errors.password = 'Password needs a number';
  return errors;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

// POST /api/auth/signup
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  const errors = validateSignup({ name, email, password });
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ errors: { email: 'Email already registered' } });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name.trim(), email.toLowerCase(), hash);

  const user = { id: info.lastInsertRowid, name: name.trim(), email: email.toLowerCase() };
  const token = signToken(user);

  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ errors: { general: 'Email and password are required' } });
  }

  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ errors: { general: 'Invalid email or password' } });
  }

  const user = { id: row.id, name: row.name, email: row.email };
  const token = signToken(user);

  res.json({ token, user });
});

// GET /api/auth/me  (protected — used by frontend to verify session / load protected page data)
router.get('/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ user: row });
});

module.exports = router;
