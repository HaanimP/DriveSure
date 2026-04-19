import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// For Railway deployment, use environment variables
// Remove quotes if they exist (Railway sometimes adds them)
const getEnvValue = (key) => {
  let value = process.env[key] || '';
  // Remove surrounding quotes if present
  return value.replace(/^["']|["']$/g, '');
};

// Build pool configuration
const poolConfig = {
  host: getEnvValue('DB_HOST') || 'mysql.railway.internal',
  port: parseInt(getEnvValue('DB_PORT')) || 3306,
  user: getEnvValue('DB_USER') || 'root',
  password: getEnvValue('DB_PASSWORD'),
  database: getEnvValue('DB_NAME') || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Database Config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  user: poolConfig.user,
  database: poolConfig.database
});

const pool = mysql.createPool(poolConfig);

export default pool;
