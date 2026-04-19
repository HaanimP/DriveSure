import express from 'express';
import pool from '../config.js';

const router = express.Router();

// Create request
router.post('/', async (req, res) => {
  let connection;
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

    console.log('📝 POST /api/requests received at', new Date().toISOString());
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

    console.log('✅ All validations passed');

    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    // Try using customer_id first (production Railway uses this), fall back to user_id if needed
    let insertQuery;
    try {
      // Try customer_id first (production column name)
      const [result] = await connection.query(
        'INSERT INTO requests (customer_id, car_type, make, year_range, budget_min, budget_max, area, plan, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uid, ctype, mk, yr, bmin, bmax, ar, pl, nt, 'pending']
      );
      console.log('✅ Request created with customer_id - ID:', result.insertId);
      res.json({ id: result.insertId, message: 'Request created successfully' });
    } catch (customerIdError) {
      // If customer_id fails (bad field or default value issue), try user_id
      if (customerIdError.code === 'ER_BAD_FIELD_ERROR' || customerIdError.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        console.log('⚠️  customer_id column issue, trying user_id:', customerIdError.code);
        try {
          const [result] = await connection.query(
            'INSERT INTO requests (user_id, car_type, make, year_range, budget_min, budget_max, area, plan, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [uid, ctype, mk, yr, bmin, bmax, ar, pl, nt, 'pending']
          );
          console.log('✅ Request created with user_id - ID:', result.insertId);
          res.json({ id: result.insertId, message: 'Request created successfully' });
        } catch (userIdError) {
          console.error('❌ Both customer_id and user_id failed');
          throw userIdError;
        }
      } else {
        throw customerIdError;
      }
    }
  } catch (error) {
    console.error('❌ Create request error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to create request', code: error.code, message: error.message });
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

// Get all requests
router.get('/all', async (req, res) => {
  let connection;
  try {
    console.log('📊 GET /api/requests/all called at', new Date().toISOString());
    
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    // Try customer_id first (production), then user_id
    let query = `
      SELECT r.*, u.first_name, u.last_name, u.email, u.phone
      FROM requests r
      JOIN users u ON r.customer_id = u.id
      ORDER BY r.created_at DESC
    `;
    
    try {
      const [requests] = await connection.query(query);
      console.log('✅ Query executed with customer_id, found', requests.length, 'requests');
      res.json({ requests });
    } catch (err) {
      // Try with user_id
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️  customer_id column not found, trying user_id');
        query = `
          SELECT r.*, u.first_name, u.last_name, u.email, u.phone
          FROM requests r
          JOIN users u ON r.user_id = u.id
          ORDER BY r.created_at DESC
        `;
        const [requests] = await connection.query(query);
        console.log('✅ Query executed with user_id, found', requests.length, 'requests');
        res.json({ requests });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Get requests error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch requests', code: error.code, message: error.message });
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

// Get agent view requests
router.get('/agent/view', async (req, res) => {
  let connection;
  try {
    console.log('📊 GET /api/requests/agent/view called at', new Date().toISOString());
    
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    let query = `
      SELECT r.*, u.first_name, u.last_name, u.email, u.phone
      FROM requests r
      JOIN users u ON r.customer_id = u.id
      WHERE r.status IN ('pending', 'in-progress')
      ORDER BY r.created_at DESC
    `;
    
    try {
      const [requests] = await connection.query(query);
      console.log('✅ Query executed with customer_id, found', requests.length, 'requests');
      res.json({ requests });
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️  customer_id column not found, trying user_id');
        query = `
          SELECT r.*, u.first_name, u.last_name, u.email, u.phone
          FROM requests r
          JOIN users u ON r.user_id = u.id
          WHERE r.status IN ('pending', 'in-progress')
          ORDER BY r.created_at DESC
        `;
        const [requests] = await connection.query(query);
        console.log('✅ Query executed with user_id, found', requests.length, 'requests');
        res.json({ requests });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Get agent requests error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch requests', code: error.code, message: error.message });
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

// Get user requests
router.get('/user/:userId', async (req, res) => {
  let connection;
  try {
    console.log('📊 GET /api/requests/user/:' + req.params.userId + ' called at', new Date().toISOString());
    
    const { userId } = req.params;
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    let query = 'SELECT * FROM requests WHERE customer_id = ? ORDER BY created_at DESC';
    
    try {
      const [requests] = await connection.query(query, [userId]);
      console.log('✅ Query executed with customer_id, found', requests.length, 'requests for user', userId);
      res.json({ requests });
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️  customer_id column not found, trying user_id');
        query = 'SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC';
        const [requests] = await connection.query(query, [userId]);
        console.log('✅ Query executed with user_id, found', requests.length, 'requests for user', userId);
        res.json({ requests });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Get user requests error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to get requests', code: error.code, message: error.message });
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

// Get all requests (general)
router.get('/', async (req, res) => {
  let connection;
  try {
    console.log('📊 GET /api/requests called at', new Date().toISOString());
    
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    let query = 'SELECT * FROM requests ORDER BY created_at DESC';
    
    try {
      const [requests] = await connection.query(query);
      console.log('✅ Query executed with user_id, found', requests.length, 'requests');
      res.json(requests);
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('⚠️  user_id issues, trying to get raw data');
        // If there are column issues, just select without filtering
        const [requests] = await connection.query('SELECT * FROM requests ORDER BY created_at DESC');
        console.log('✅ Query executed, found', requests.length, 'requests');
        res.json(requests);
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('❌ Get requests error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to get requests', code: error.code, message: error.message });
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

// Update request status
router.put('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status, agentNotes, scheduleDate } = req.body;
    connection = await pool.getConnection();
    await connection.query(
      'UPDATE requests SET status = ?, agent_notes = ?, schedule_date = ? WHERE id = ?',
      [status || 'pending', agentNotes || '', scheduleDate || null, id]
    );
    res.json({ message: 'Request updated' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update request' });
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
