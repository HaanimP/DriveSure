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

// Build connection from database URL if available, otherwise use individual vars
let poolConfig;
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (dbUrl) {
  // Parse connection string (mysql://user:pass@host:port/database)
  poolConfig = {
    uri: dbUrl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
} else {
  // Use individual environment variables
  poolConfig = {
    host: getEnvValue('DB_HOST'),
    user: getEnvValue('DB_USER'),
    password: getEnvValue('DB_PASSWORD'),
    database: getEnvValue('DB_NAME'),
    port: parseInt(getEnvValue('DB_PORT')) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

const pool = mysql.createPool(poolConfig);

export default pool;
