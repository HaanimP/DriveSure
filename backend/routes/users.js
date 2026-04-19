import express from 'express';
import pool from '../config.js';

const router = express.Router();

// Get all users (admin)
router.get('/', async (req, res) => {
  let connection;
  try {
    console.log('📊 GET /api/users called at', new Date().toISOString());
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    const [users] = await connection.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    console.log('✅ Query executed, found', users.length, 'user(s)');
    console.log('   Users:', users.map(u => ({ id: u.id, name: u.first_name + ' ' + u.last_name, role: u.role })));
    
    res.json(users);
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
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

// Get user by ID
router.get('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
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
