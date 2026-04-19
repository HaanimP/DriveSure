import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// For Railway deployment, prefer using MYSQL_URL directly if available
const connectionString = process.env.MYSQL_URL;

let poolConfig;

if (connectionString) {
  console.log('🔗 Using connection string from MYSQL_URL');
  // Parse connection string
  const url = new URL(connectionString);
  poolConfig = {
    host: url.hostname,
    port: url.port ? parseInt(url.port) : 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
} else {
  console.log('🔗 Using individual environment variables');
  // Remove quotes if they exist
  const getEnvValue = (key) => {
    let value = process.env[key] || '';
    return value.replace(/^["']|["']$/g, '');
  };

  poolConfig = {
    host: getEnvValue('DB_HOST') || 'mysql',
    port: parseInt(getEnvValue('DB_PORT')) || 3306,
    user: getEnvValue('DB_USER') || 'root',
    password: getEnvValue('DB_PASSWORD'),
    database: getEnvValue('DB_NAME') || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

console.log('📋 Database Config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  user: poolConfig.user,
  database: poolConfig.database
});

const pool = mysql.createPool(poolConfig);

// Handle pool connection errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

console.log('⏳ Testing database connection...');
// Test connection on startup (non-blocking with timeout)
const connectionTestTimeout = setTimeout(() => {
  console.warn('⚠️  Database connection test timed out after 10 seconds');
}, 10000);

pool.getConnection()
  .then(conn => {
    clearTimeout(connectionTestTimeout);
    console.log('✅ Database connection successful!');
    conn.release();
  })
  .catch(err => {
    clearTimeout(connectionTestTimeout);
    console.error('⚠️  Database connection failed:', err.message);
    console.error('    Code:', err.code);
    console.error('    Will attempt to reconnect when routes are called');
  });

export default pool;
