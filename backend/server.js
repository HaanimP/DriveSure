import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pool from './config.js';
import authRoutes from './routes/auth.js';
import requestRoutes from './routes/requests.js';
import reviewRoutes from './routes/reviews.js';
import contactRoutes from './routes/contact.js';
import profileRoutes from './routes/profile.js';
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('../public'));

// Request inspection middleware
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log(`\n🔵 [${req.method}] ${req.path}`);
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    console.log('Body:', req.body);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Drive Sure Backend running on http://localhost:${PORT}`);
});

export { pool };
