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
  let connection;
  try {
    const userId = req.params.userId;
    console.log('📊 GET /api/profile/:' + userId + ' called at', new Date().toISOString());
    console.log('   User making request (from token):', req.user);
    
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    const [users] = await connection.query('SELECT id, first_name, last_name, email, phone, role, profile_picture, created_at FROM users WHERE id = ?', [userId]);
    console.log('✅ Query executed, found', users.length, 'user(s)');
    
    if (users.length > 0) {
      console.log('   User data:', {
        id: users[0].id,
        first_name: users[0].first_name,
        last_name: users[0].last_name,
        email: users[0].email,
        phone: users[0].phone,
        role: users[0].role,
        created_at: users[0].created_at
      });
    }

    if (users.length === 0) {
      console.warn('⚠️ User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('❌ Profile fetch error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch profile', code: error.code, message: error.message });
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

// Update user profile
router.put('/:userId', verifyToken, async (req, res) => {
  let connection;
  try {
    console.log('📝 PUT /api/profile/:' + req.params.userId + ' called at', new Date().toISOString());
    
    const { first_name, last_name, phone, profile_picture } = req.body;
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');

    const [result] = await connection.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, profile_picture = ? WHERE id = ?',
      [first_name, last_name, phone || '', profile_picture || null, req.params.userId]
    );
    console.log('✅ Query executed, affected rows:', result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('❌ Profile update error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to update profile', code: error.code, message: error.message });
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

// Change password
router.post('/:userId/change-password', verifyToken, async (req, res) => {
  let connection;
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    connection = await pool.getConnection();
    const [users] = await connection.query('SELECT password_hash FROM users WHERE id = ?', [req.params.userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.params.userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
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

// Get user statistics (for agents/admin)
router.get('/:userId/stats', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Get requests count and average rating
    const [stats] = await connection.query(`
      SELECT 
        COUNT(r.id) as total_requests,
        AVG(rev.rating) as average_rating,
        SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as completed_requests
      FROM requests r
      LEFT JOIN reviews rev ON r.id = rev.request_id
      WHERE r.user_id = ?
    `, [req.params.userId]);

    res.json(stats[0] || {});
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
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

export default router;
