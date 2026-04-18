import express from 'express';
import pool from '../config.js';

const router = express.Router();

// Create request
router.post('/', async (req, res) => {
  try {
    const uid = req.body.user_id;
    const ctype = req.body.car_type;
    const mk = req.body.make;
    const yr = req.body.year_range;
    const bmin = req.body.budget_min;
    const bmax = req.body.budget_max;
    const ar = req.body.area;
    const pl = req.body.plan || 'Premium';
    const nt = req.body.notes || '';

    console.log('POST /requests received:');
    console.log('  user_id:', uid);
    console.log('  car_type:', ctype);
    console.log('  make:', mk);
    console.log('  year_range:', yr);
    console.log('  budget_min:', bmin);
    console.log('  budget_max:', bmax);
    console.log('  area:', ar);

    // Validation
    if (!uid) return res.status(400).json({ error: 'Missing user_id' });
    if (!ctype) return res.status(400).json({ error: 'Missing car_type' });
    if (!mk) return res.status(400).json({ error: 'Missing make' });
    if (!yr) return res.status(400).json({ error: 'Missing year_range' });
    if (!ar) return res.status(400).json({ error: 'Missing area' });
    if (bmin === undefined || bmin === null) return res.status(400).json({ error: 'Missing budget_min' });
    if (bmax === undefined || bmax === null) return res.status(400).json({ error: 'Missing budget_max' });

    console.log('All validations passed');

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO requests (user_id, car_type, make, year_range, budget_min, budget_max, area, plan, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [uid, ctype, mk, yr, bmin, bmax, ar, pl, nt, 'pending']
    );
    connection.release();

    console.log('Request created - ID:', result.insertId);
    res.json({ id: result.insertId, message: 'Request created successfully' });
  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get all requests
router.get('/all', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [requests] = await connection.query(`
      SELECT r.*, u.first_name, u.last_name, u.email, u.phone
      FROM requests r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    connection.release();
    res.json({ requests });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get agent view requests
router.get('/agent/view', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [requests] = await connection.query(`
      SELECT r.*, u.first_name, u.last_name, u.email, u.phone
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.status IN ('pending', 'in-progress')
      ORDER BY r.created_at DESC
    `);
    connection.release();
    res.json({ requests });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get user requests
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    const [requests] = await connection.query('SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    connection.release();
    res.json({ requests });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get all requests (general)
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [requests] = await connection.query('SELECT * FROM requests ORDER BY created_at DESC');
    connection.release();
    res.json(requests);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Update request status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agentNotes, scheduleDate } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE requests SET status = ?, agent_notes = ?, schedule_date = ? WHERE id = ?',
      [status || 'pending', agentNotes || '', scheduleDate || null, id]
    );
    connection.release();
    res.json({ message: 'Request updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

export default router;
