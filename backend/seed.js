import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Helper to get env value and remove quotes
const getEnvValue = (key) => {
  let value = process.env[key] || '';
  return value.replace(/^["']|["']$/g, '');
};

// Create pool with current environment credentials
const pool = mysql.createPool({
  host: getEnvValue('DB_HOST') || 'localhost',
  port: parseInt(getEnvValue('DB_PORT')) || 3306,
  user: getEnvValue('DB_USER') || 'root',
  password: getEnvValue('DB_PASSWORD'),
  database: getEnvValue('DB_NAME') || 'drivesure',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Predefined users to seed
const SEED_USERS = [
  {
    first_name: 'Haanim',
    last_name: 'Pietersen',
    email: 'haanimpietersen@gmail.com',
    password: 'Haanim@13',
    phone: '+27 123 456 7890',
    role: 'admin'
  },
  {
    first_name: 'Fagrie',
    last_name: 'Agent',
    email: 'fagrie13@gmail.com',
    password: 'Fagrie@13',
    phone: '+27 987 654 3210',
    role: 'agent'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log(`📍 Database: ${getEnvValue('DB_NAME') || 'drivesure'}`);
    console.log(`🖥️  Host: ${getEnvValue('DB_HOST') || 'localhost'}`);
    
    const connection = await pool.getConnection();

    for (const user of SEED_USERS) {
      try {
        // Check if user already exists
        const [existing] = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );

        if (existing.length > 0) {
          console.log(`⚠️  User ${user.email} already exists, updating...`);
          // Update existing user with new password (hash it first)
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await connection.query(
            'UPDATE users SET password_hash = ?, phone = ? WHERE email = ?',
            [hashedPassword, user.phone, user.email]
          );
          console.log(`✅ Updated ${user.email}`);
        } else {
          console.log(`➕ Creating new user: ${user.email}`);
          // Create new user
          const hashedPassword = await bcrypt.hash(user.password, 10);
          
          await connection.query(
            'INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
            [user.first_name, user.last_name, user.email, user.phone, hashedPassword, user.role]
          );
          console.log(`✅ Created ${user.email} as ${user.role}`);
        }
      } catch (userError) {
        console.error(`❌ Error processing ${user.email}:`, userError.message);
      }
    }

    connection.release();
    console.log('\n✨ Database seeding completed!');
    console.log('\n📋 Seeded Users:');
    console.log('─'.repeat(60));
    console.log('ADMIN:');
    console.log(`  Email: haanimpietersen@gmail.com`);
    console.log(`  Password: Haanim@13`);
    console.log('\nAGENT:');
    console.log(`  Email: fagrie13@gmail.com`);
    console.log(`  Password: Fagrie@13`);
    console.log('─'.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
