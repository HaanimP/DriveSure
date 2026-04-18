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

const pool = mysql.createPool({
  host: getEnvValue('DB_HOST') || 'mysql',  // Default to 'mysql' service name in Railway
  user: getEnvValue('DB_USER') || 'root',
  password: getEnvValue('DB_PASSWORD'),
  database: getEnvValue('DB_NAME') || 'railway',
  port: getEnvValue('DB_PORT') || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
