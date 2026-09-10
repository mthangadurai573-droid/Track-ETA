const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const sessions = new Set();

router.post('/admin/login', (req, res) => {
  const username = String(req.body?.username || '');
  const password = String(req.body?.password || '');
  const expectedUsername = process.env.ADMIN_USERNAME || 'thangadurai';
  const expectedEmail = process.env.ADMIN_EMAIL || 'admin@railpredict.ai';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'durai143';

  if ((username !== expectedUsername && username !== expectedEmail) || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = crypto.randomUUID();
  sessions.add(token);
  return res.json({ token, username });
});

router.post('/admin/logout', (req, res) => {
  const token = String(req.body?.token || '');
  sessions.delete(token);
  return res.json({ status: 'logged_out' });
});

function requireAdmin(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !sessions.has(token)) return res.status(401).json({ error: 'Admin login required' });
  return next();
}

module.exports = { router, requireAdmin };
