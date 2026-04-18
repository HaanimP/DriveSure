import express from 'express';
import pool from '../config.js';

const router = express.Router();

// Get all users (admin)
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    connection.release();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, first_name, last_name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
    connection.release();
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
