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
import { runMigration } from './migrate-production.js';

dotenv.config();

console.log('🔧 SERVER STARTUP - Environment Variables:');
console.log('   PORT:', process.env.PORT || '3001');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? `✅ Present (${process.env.JWT_SECRET.substring(0, 30)}...)` : '❌ UNDEFINED!');
console.log('   DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['https://drive-sure-lyart.vercel.app', 'http://localhost:5173', 'http://localhost:3000'];
    
    // Allow requests with no origin (Postman, curl, etc) or from allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️  CORS blocked origin:', origin);
      callback(null, true); // For now, allow all to debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

// Simple root endpoint for readiness check
app.get('/', (req, res) => {
  res.json({ status: 'OK' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Drive Sure Backend running on 0.0.0.0:${PORT}`);
  console.log(`✅ CORS enabled for: https://drive-sure-lyart.vercel.app`);
  
  // Run migrations on startup
  console.log('\n📋 Running database migrations...');
  runMigration().catch(err => {
    console.error('⚠️  Migration warning (non-blocking):', err.message);
  });
});

export { pool };
