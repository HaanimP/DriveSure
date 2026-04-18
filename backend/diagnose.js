#!/usr/bin/env node
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
  console.log('🔍 DriveSure Backend Diagnostics\n');
  console.log('─'.repeat(60));
  
  // Check environment variables
  console.log('\n📋 Environment Configuration:');
  console.log(`  DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
  console.log(`  DB_PORT: ${process.env.DB_PORT || '3306'}`);
  console.log(`  DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
  console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '(set)' : '(empty)'}`);
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '(set)' : 'NOT SET'}`);
  console.log(`  PORT: ${process.env.PORT || '3001'}`);
  
  // Check MySQL connection
  console.log('\n🔌 Testing MySQL Connection...');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('  ✅ MySQL connection successful');
    
    // Check if database exists
    console.log('\n📦 Checking Database...');
    try {
      await connection.query(`USE ${process.env.DB_NAME || 'drivesure'}`);
      console.log(`  ✅ Database "${process.env.DB_NAME || 'drivesure'}" exists`);
      
      // Check tables
      console.log('\n📋 Checking Tables...');
      const [tables] = await connection.query("SHOW TABLES");
      if (tables.length === 0) {
        console.log('  ❌ No tables found! Run: mysql -u root -p < database-setup.sql');
      } else {
        console.log(`  ✅ Found ${tables.length} tables:`);
        tables.forEach(t => {
          const tableName = Object.values(t)[0];
          console.log(`     - ${tableName}`);
        });
      }
      
      // Check users
      console.log('\n👥 Checking Users Table...');
      try {
        const [users] = await connection.query('SELECT id, first_name, last_name, email, role FROM users');
        if (users.length === 0) {
          console.log('  ⚠️  No users found! Run: npm run seed');
        } else {
          console.log(`  ✅ Found ${users.length} users:`);
          users.forEach(u => {
            console.log(`     - ${u.first_name} ${u.last_name} (${u.email}) - ${u.role}`);
          });
        }
      } catch (tableError) {
        console.log('  ❌ Error reading users table:', tableError.message);
      }
      
    } catch (dbError) {
      console.log(`  ❌ Database "${process.env.DB_NAME || 'drivesure'}" not found!`);
      console.log('     Run: mysql -u root -p < backend/database-setup.sql');
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('  ❌ MySQL connection failed:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('  1. Verify MySQL is running');
    console.log('  2. Check .env file credentials');
    console.log('  3. Ensure DB_HOST is correct (usually localhost)');
    console.log('  4. Check DB_USER and DB_PASSWORD are correct');
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log('✨ Diagnostics complete\n');
}

diagnose().catch(console.error);
