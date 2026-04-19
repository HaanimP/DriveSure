import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.railway') });

const MYSQL_URL = process.env.MYSQL_URL;

if (!MYSQL_URL) {
  console.error('❌ MYSQL_URL environment variable not set');
  process.exit(1);
}

async function runMigration() {
  let connection;
  let pool;
  try {
    console.log('🔗 Connecting to Railway MySQL...');
    pool = mysql.createPool(MYSQL_URL);
    connection = await pool.getConnection();
    
    console.log('✅ Connected to database');
    
    // 1. Fix reviews table - add approved column if missing
    console.log('\n📋 Checking reviews table schema...');
    try {
      await connection.query(`
        ALTER TABLE reviews 
        ADD COLUMN approved BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added approved column to reviews table');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ approved column already exists');
      } else {
        throw err;
      }
    }
    
    // 2. Ensure users table has password_hash instead of password
    console.log('\n📋 Checking users table schema...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = 'railway'
    `);
    
    const hasPasswordColumn = columns.some(col => col.COLUMN_NAME === 'password');
    const hasPasswordHashColumn = columns.some(col => col.COLUMN_NAME === 'password_hash');
    
    if (hasPasswordColumn && !hasPasswordHashColumn) {
      console.log('⚠️  Renaming password column to password_hash...');
      await connection.query(`
        ALTER TABLE users RENAME COLUMN password TO password_hash
      `);
      console.log('✅ Renamed password column to password_hash');
    } else if (hasPasswordHashColumn) {
      console.log('✅ password_hash column already exists');
    } else if (!hasPasswordHashColumn && !hasPasswordColumn) {
      console.log('❌ Neither password nor password_hash column exists!');
      throw new Error('Users table schema is broken');
    }
    
    // 3. Seed admin user
    console.log('\n👤 Seeding admin user...');
    const adminEmail = 'haanimpietersen@gmail.com';
    const adminPassword = 'Haanim@13';
    
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );
    
    if (existing.length > 0) {
      console.log(`⚠️  Admin user already exists, updating password...`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hashedPassword, adminEmail]
      );
      console.log(`✅ Updated admin password`);
    } else {
      console.log(`➕ Creating admin user...`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await connection.query(
        'INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['Haanim', 'Pietersen', adminEmail, '+27 123 456 7890', hashedPassword, 'admin']
      );
      console.log(`✅ Created admin user`);
    }
    
    // 3b. Seed agent user
    console.log('\n👤 Seeding agent user...');
    const agentEmail = 'fagrie13@gmail.com';
    const agentPassword = 'Fagrie@13';
    
    const [existingAgent] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [agentEmail]
    );
    
    if (existingAgent.length > 0) {
      console.log(`⚠️  Agent user already exists, updating password...`);
      const hashedPassword = await bcrypt.hash(agentPassword, 10);
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hashedPassword, agentEmail]
      );
      console.log(`✅ Updated agent password`);
    } else {
      console.log(`➕ Creating agent user...`);
      const hashedPassword = await bcrypt.hash(agentPassword, 10);
      await connection.query(
        'INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        ['Fagrie', 'Agent', agentEmail, '+27 987 654 3210', hashedPassword, 'agent']
      );
      console.log(`✅ Created agent user`);
    }
    
    // 4. Verify tables and data
    console.log('\n📊 Verifying database...');
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [requests] = await connection.query('SELECT COUNT(*) as count FROM requests');
    const [reviews] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    const [contacts] = await connection.query('SELECT COUNT(*) as count FROM contact_messages');
    
    console.log(`Users: ${users[0].count}`);
    console.log(`Requests: ${requests[0].count}`);
    console.log(`Reviews: ${reviews[0].count}`);
    console.log(`Contact Messages: ${contacts[0].count}`);
    
    console.log('\n✨ Migration completed successfully!');
    console.log('\n🔓 Login credentials:');
    console.log(`  ADMIN:`);
    console.log(`    Email: ${adminEmail}`);
    console.log(`    Password: ${adminPassword}`);
    console.log(`  AGENT:`);
    console.log(`    Email: ${agentEmail}`);
    console.log(`    Password: ${agentPassword}`);
    
    connection.release();
    if (pool) {
      await pool.end();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) {
      try {
        connection.release();
      } catch (e) {
        // Ignore
      }
    }
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // Ignore
      }
    }
    throw error;
  }
}

async function migrate() {
  await runMigration();
  process.exit(0);
}

// Export for use in server.js
export { runMigration };

// If run directly, execute migration
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate();
}
