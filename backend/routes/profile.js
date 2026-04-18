import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config.js';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, first_name, last_name, email, phone, role, profile_picture, created_at FROM users WHERE id = ?', [req.params.userId]);
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { first_name, last_name, phone, profile_picture } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, profile_picture = ? WHERE id = ?',
      [first_name, last_name, phone || '', profile_picture || null, req.params.userId]
    );

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/:userId/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT password_hash FROM users WHERE id = ?', [req.params.userId]);

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.params.userId]);
    connection.release();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user statistics (for agents/admin)
router.get('/:userId/stats', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get requests count and average rating
    const [stats] = await connection.query(`
      SELECT 
        COUNT(r.id) as total_requests,
        AVG(rev.rating) as average_rating,
        SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as completed_requests
      FROM requests r
      LEFT JOIN reviews rev ON r.id = rev.request_id
      WHERE r.agent_id = ? OR r.customer_id = ?
    `, [req.params.userId, req.params.userId]);

    connection.release();
    res.json(stats[0] || {});
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
