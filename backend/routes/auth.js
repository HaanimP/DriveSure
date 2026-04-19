import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  let connection;
  try {
    const { first, last, email, phone, password } = req.body;

    if (!first || !last || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    connection = await pool.getConnection();

    // Check if user exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.query(
      'INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [first, last, email, phone || '', hashedPassword, 'customer']
    );

    const user = { id: result.insertId, first, last, email, role: 'customer' };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    console.error('Register error:', error.message, error.code);
    res.status(500).json({ error: 'Registration failed', code: error.code });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e.message);
      }
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    connection = await pool.getConnection();
    console.log(`[LOGIN] Querying user: ${email}`);
    
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      console.log(`[LOGIN] User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log(`[LOGIN] User found: ${user.first_name} ${user.last_name} (role: ${user.role})`);
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`[LOGIN] Password match: ${passwordMatch}`);

    if (!passwordMatch) {
      console.log(`[LOGIN] Invalid password for user: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userResponse = { id: user.id, first: user.first_name, last: user.last_name, email: user.email, role: user.role };
    const token = jwt.sign(userResponse, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(`[LOGIN] Login successful for: ${email}`);
    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('[LOGIN] Error:', error.message, error.code);
    res.status(500).json({ error: 'Login failed', code: error.code });
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (e) {
        console.error('Error releasing connection:', e.message);
      }
    }
  }
});

// Verify token
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded, valid: true });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', valid: false });
  }
});

export default router;
