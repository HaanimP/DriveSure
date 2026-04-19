import express from 'express';
import pool from '../config.js';

const router = express.Router();

// Create review
router.post('/', async (req, res) => {
  let connection;
  try {
    // Accept both old format (stars, text, plan) and new format (rating, comment, requestId)
    const { userId, userName, stars, text, plan, requestId, rating, comment } = req.body;
    console.log('📝 Creating review with data:', req.body);

    // Map frontend fields to database fields
    const customerId = userId;
    const reviewRating = rating || stars;
    const reviewComment = comment || text;
    const reviewRequestId = requestId || null;

    if (!customerId || !reviewRating || !reviewComment) {
      console.warn('⚠️ Missing required fields:', { customerId, reviewRating, reviewComment });
      return res.status(400).json({ error: 'Missing required fields: userId, rating/stars, comment/text' });
    }

    connection = await pool.getConnection();
    
    // Use actual database columns: customer_id, request_id, rating, comment
    const [result] = await connection.query(
      `INSERT INTO reviews (customer_id, request_id, rating, comment, is_approved, approved)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customerId, reviewRequestId, reviewRating, reviewComment, true, true]
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

// Get user's own reviews (customer dashboard)
router.get('/user/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    console.log('📊 GET /api/reviews/user/:userId called with userId:', userId);
    
    connection = await pool.getConnection();
    
    // Get reviews for specific user
    const [reviews] = await connection.query(`
      SELECT 
        r.id,
        r.rating as stars,
        r.comment as text,
        COALESCE(u.first_name, 'Anonymous') as user_name,
        'Premium' as plan,
        r.customer_id,
        r.request_id,
        r.agent_id,
        r.is_approved,
        r.approved,
        r.created_at
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      WHERE r.customer_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    
    console.log('✅ User reviews query executed, found', reviews.length, 'reviews for user', userId);
    console.log('📋 Reviews:', reviews);
    
    res.json(reviews);
  } catch (error) {
    console.error('❌ Get user reviews error:', error.message);
    res.status(500).json({ error: 'Failed to get user reviews', details: error.message });
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

// Debug endpoint - show all reviews with all columns
router.get('/debug/all', async (req, res) => {
  let connection;
  try {
    console.log('🔍 DEBUG /api/reviews/debug/all called');
    
    connection = await pool.getConnection();
    
    // Get ALL data from reviews table with all columns
    const [reviews] = await connection.query(`
      SELECT * FROM reviews
    `);
    
    // Also get column info
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'reviews' AND TABLE_SCHEMA = 'railway'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('🔍 DEBUG: Found', reviews.length, 'reviews total');
    console.log('🔍 DEBUG: Reviews data:', JSON.stringify(reviews, null, 2));
    
    res.json({ 
      total: reviews.length,
      reviews: reviews,
      schema: columns,
      message: 'This is debug data - includes all reviews regardless of approval status'
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error.message);
    res.status(500).json({ error: 'Failed to get debug data', details: error.message });
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
    
    // Join with users table to get user name, map database columns to frontend format
    const [reviews] = await connection.query(`
      SELECT 
        r.id,
        r.rating as stars,
        r.comment as text,
        COALESCE(u.first_name, 'Anonymous') as user_name,
        'Premium' as plan,
        r.customer_id,
        r.request_id,
        r.agent_id,
        r.is_approved,
        r.approved,
        r.created_at
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      WHERE r.approved = true
      ORDER BY r.created_at DESC
    `);
    console.log('✅ Query executed, found', reviews.length, 'reviews');
    console.log('📋 Sample review:', reviews.length > 0 ? reviews[0] : 'none');
    
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
    console.log('📊 GET /api/reviews/admin/all called');
    
    connection = await pool.getConnection();
    
    // Join with users table to get user name and request info
    const [reviews] = await connection.query(`
      SELECT 
        r.id,
        r.rating as stars,
        r.comment as text,
        COALESCE(u.first_name, 'Anonymous') as user_name,
        'Premium' as plan,
        r.customer_id,
        r.request_id,
        r.agent_id,
        r.is_approved,
        r.approved,
        r.created_at
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      ORDER BY r.created_at DESC
    `);
    console.log('✅ Admin query executed, found', reviews.length, 'reviews');
    res.json(reviews);
  } catch (error) {
    console.error('❌ Get all reviews error:', error.message);
    res.status(500).json({ error: 'Failed to get reviews', details: error.message });
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
