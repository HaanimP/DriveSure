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
    connectionLimit: 20,
    queueLimit: 5
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
    connectionLimit: 20,
    queueLimit: 5
  };
}

console.log('📋 Database Config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  user: poolConfig.user,
  database: poolConfig.database,
  connectionLimit: poolConfig.connectionLimit
});

const pool = mysql.createPool(poolConfig);

// Handle pool connection errors
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.code, err.message);
});

pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    console.error('❌ Connection error:', err.code, err.message);
  });
});

console.log('⏳ Testing database connection...');
// Test connection on startup with proper error handling
testConnection();

async function testConnection() {
  let connection;
  try {
    connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout after 5 seconds')), 5000)
      )
    ]);
    
    // Test with a simple query
    const [result] = await Promise.race([
      connection.query('SELECT 1 as test'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query test timeout after 5 seconds')), 5000)
      )
    ]);
    
    console.log('✅ Database connection and query test successful!');
    console.log('   Connected to:', poolConfig.host, ':', poolConfig.port);
    console.log('   Database:', poolConfig.database);
    connection.release();
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    console.error('   Host:', poolConfig.host);
    console.error('   Port:', poolConfig.port);
    console.error('   Database:', poolConfig.database);
    console.error('   Error Code:', err.code);
    console.error('   Make sure mysql.railway.internal is accessible from this container');
    if (connection) {
      try {
        connection.release();
      } catch (e) {
        // Ignore release errors
      }
    }
  }
}

export default pool;
