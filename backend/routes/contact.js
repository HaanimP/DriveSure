import express from 'express';
import pool from '../config.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'drivesure13@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your_app_password_here'
  }
});

// Verify transporter on startup (non-blocking)
transporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️ Email transporter not available (emails won\'t be sent):', error.code);
  } else {
    console.log('✅ Email transporter verified and ready');
  }
});

// Submit contact form
router.post('/', async (req, res) => {
  let connection;
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // FIRST: Save message to database (most important)
    connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
      [name, email, subject, message]
    );

    console.log('✅ Contact message saved to database with ID:', result.insertId);

    // SECOND: Try to send emails (don't block if it fails)
    const adminMailOptions = {
      from: process.env.EMAIL_USER || 'drivesure13@gmail.com',
      to: 'drivesure13@gmail.com',
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> Contact them to follow up</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Received on: ${new Date().toLocaleString()}</small></p>
      `
    };

    const userMailOptions = {
      from: process.env.EMAIL_USER || 'drivesure13@gmail.com',
      to: email,
      subject: 'We received your message - DriveSure',
      html: `
        <h2>Thank You for Contacting DriveSure</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and will get back to you as soon as possible during our business hours:</p>
        <p><strong>Business Hours:</strong></p>
        <ul>
          <li>Monday - Friday: 09:00 - 16:00</li>
          <li>Saturday: 09:00 - 12:00</li>
        </ul>
        <p><strong>Contact Details:</strong></p>
        <p>Phone: +27 839 958 822</p>
        <p>Email: drivesure13@gmail.com</p>
        <p>Location: Cape Town, South Africa</p>
        <br>
        <p>Best regards,<br>The DriveSure Team</p>
      `
    };

    // Send emails asynchronously (don't wait)
    transporter.sendMail(adminMailOptions).then(() => {
      console.log('✅ Admin email sent successfully');
    }).catch((err) => {
      console.error('⚠️ Failed to send admin email:', err.message);
    });

    transporter.sendMail(userMailOptions).then(() => {
      console.log('✅ User confirmation email sent successfully');
    }).catch((err) => {
      console.error('⚠️ Failed to send user confirmation email:', err.message);
    });

    // Always return success to user (message saved to database)
    res.json({ id: result.insertId, message: 'Message sent successfully! We will contact you soon.' });
  } catch (error) {
    console.error('❌ Contact form error:', error.message, error.code);
    res.status(500).json({ error: 'Failed to submit contact form', code: error.code });
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

// Get all messages (admin)
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [messages] = await connection.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
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

// Delete contact message
router.delete('/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.query('DELETE FROM contact_messages WHERE id = ?', [id]);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
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
