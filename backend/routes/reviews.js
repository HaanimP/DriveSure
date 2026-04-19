import express from 'express';
import pool from '../config.js';

const router = express.Router();

// Create review
router.post('/', async (req, res) => {
  let connection;
  try {
    const { userId, requestId, rating, comment } = req.body;
    console.log('📝 Creating review with data:', { userId, requestId, rating, comment });

    if (!userId || !requestId || !rating || !comment) {
      console.warn('⚠️ Missing required fields:', { userId, requestId, rating, comment });
      return res.status(400).json({ error: 'Missing required fields: userId, requestId, rating, comment' });
    }

    connection = await pool.getConnection();
    
    // Use actual database columns: customer_id, request_id, rating, comment
    const [result] = await connection.query(
      `INSERT INTO reviews (customer_id, request_id, rating, comment, is_approved, approved)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, requestId, rating, comment, true, true]
    );

    console.log('✅ Review created - ID:', result.insertId);
    res.json({ id: result.insertId, message: 'Review posted successfully' });
  } catch (error) {
    console.error('❌ Create review error:', error.message, error.code);
    res.status(500).json({ error: 'Failed to create review', details: error.message });
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

// Get approved reviews
router.get('/', async (req, res) => {
  let connection;
  try {
    console.log('📊 GET /api/reviews called at', new Date().toISOString());
    
    connection = await pool.getConnection();
    console.log('✅ Database connection obtained');
    
    const [reviews] = await connection.query('SELECT * FROM reviews WHERE approved = true ORDER BY created_at DESC');
    console.log('✅ Query executed, found', reviews.length, 'reviews');
    
    res.json(reviews);
  } catch (error) {
    console.error('❌ Get reviews error:', error.message, error.code);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: 'Failed to get reviews', code: error.code });
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

// Get all reviews (admin)
router.get('/admin/all', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [reviews] = await connection.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
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

// Approve review
router.put('/:id/approve', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('UPDATE reviews SET approved = true WHERE id = ?', [id]);
    res.json({ message: 'Review approved' });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ error: 'Failed to approve review' });
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

// Delete review
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
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
