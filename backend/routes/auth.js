import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate a 32-character hexadecimal token (crypto.randomBytes(16).toString('hex'))
async function generateHexToken(userId) {
  const token = crypto.randomBytes(16).toString('hex');
  // 24 hour session expiration
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  
  await db.run(`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `, token, userId, expiresAt);

  return token;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Student', rollNo, department } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.get('SELECT id FROM users WHERE LOWER(email) = ?', cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered. Please sign in instead.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(`
      INSERT INTO users (name, email, password_hash, role, roll_no, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `, name.trim(), cleanEmail, passwordHash, role, rollNo || `STU-${Date.now()}`, department || 'General Studies');

    const newUser = await db.get('SELECT id, name, email, role, roll_no, department FROM users WHERE id = ?', result.lastInsertRowid);
    const token = await generateHexToken(newUser.id);

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        rollNo: newUser.roll_no,
        department: newUser.department
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.get('SELECT * FROM users WHERE LOWER(email) = ?', cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = await generateHexToken(user.id);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.roll_no,
        department: user.department
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      rollNo: req.user.roll_no,
      department: req.user.department
    }
  });
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (token) {
      await db.run('DELETE FROM sessions WHERE token = ?', token);
    }

    return res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error during logout.' });
  }
});

export default router;
