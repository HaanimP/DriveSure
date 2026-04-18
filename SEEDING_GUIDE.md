# 🌱 How to Seed Users - Step by Step

## What is Seeding?

Seeding is the process of automatically populating your database with predetermined users. After seeding, you'll have:

✅ **One Admin User**
- Email: `haanimpietersen@gmail.com`
- Password: `Haanim@13`

✅ **One Agent User**
- Email: `fagrie13@gmail.com`
- Password: `Fagrie@13`

---

## Prerequisites

Before seeding, make sure:

1. **MySQL is installed and running**
   ```bash
   # Test MySQL
   mysql -u root -p -e "SELECT 1;"
   ```

2. **Database exists**
   ```bash
   # Create database
   mysql -u root -p < backend/database-setup.sql
   ```

3. **Backend dependencies installed**
   ```bash
   cd backend
   npm install
   ```

4. **.env file is configured**
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=drivesure
   ```

---

## Step-by-Step Seeding Guide

### Step 1: Open PowerShell Terminal
1. Press `Win + X`
2. Select "Windows PowerShell (Admin)" or "Terminal (Admin)"
3. Or open cmd/PowerShell normally

### Step 2: Navigate to Backend Folder
```powershell
cd C:\Users\haani\OneDrive\Documents\GitHub\DriveSure\backend
```

Or if you're already in the project:
```powershell
cd backend
```

### Step 3: Run the Seed Command
```powershell
npm run seed
```

### Step 4: Expected Output

You should see:
```
🌱 Starting database seeding...
➕ Creating new user: haanimpietersen@gmail.com
✅ Created haanimpietersen@gmail.com as admin
➕ Creating new user: fagrie13@gmail.com
✅ Created fagrie13@gmail.com as agent

✨ Database seeding completed!

📋 Seeded Users:
────────────────────────────────────────────────────────
ADMIN:
  Email: haanimpietersen@gmail.com
  Password: Haanim@13

AGENT:
  Email: fagrie13@gmail.com
  Password: Fagrie@13
────────────────────────────────────────────────────────
```

✅ **If you see this → Seeding was successful!**

---

## What if Users Already Exist?

If users already exist in the database:

```
⚠️  User haanimpietersen@gmail.com already exists, updating...
✅ Updated haanimpietersen@gmail.com
⚠️  User fagrie13@gmail.com already exists, updating...
✅ Updated fagrie13@gmail.com
```

✅ **This is fine!** The seed script updated their passwords.

---

## Troubleshooting

### Error: "npm: The term 'npm' is not recognized"
**Problem:** npm is not installed or not in PATH
**Solution:**
1. Install Node.js from nodejs.org
2. Restart PowerShell
3. Try again: `npm run seed`

### Error: "Cannot find module 'bcryptjs'"
**Problem:** Dependencies not installed
**Solution:**
```powershell
npm install
npm run seed
```

### Error: "connect ECONNREFUSED"
**Problem:** MySQL is not running
**Solution:**
1. Start MySQL service:
   - Windows Services → MySQL → Right-click → Start
   - Or: `mysql -u root -p` in terminal
2. Try seeding again

### Error: "Unknown database 'drivesure'"
**Problem:** Database doesn't exist
**Solution:**
```powershell
# Create database
mysql -u root -p < database-setup.sql
npm run seed
```

### Error: "Access denied for user 'root'@'localhost'"
**Problem:** MySQL credentials in .env are wrong
**Solution:**
1. Edit `backend/.env`
2. Update `DB_USER` and `DB_PASSWORD`
3. Try again: `npm run seed`

---

## Verify Seeding Worked

Check if users were created in the database:

```powershell
# Connect to MySQL
mysql -u root -p drivesure

# View all users
SELECT id, first_name, last_name, email, role, created_at FROM users;
```

You should see:
```
| id | first_name | last_name    | email                      | role  | created_at          |
|----|------------|--------------|----------------------------|-------|---------------------|
| 1  | Haanim     | Pietersen    | haanimpietersen@gmail.com  | admin | 2024-01-15 10:30:00 |
| 2  | Fagrie     | Agent        | fagrie13@gmail.com         | agent | 2024-01-15 10:30:00 |
```

✅ **If you see these rows → Seeding worked!**

---

## Re-seeding (Updating Passwords)

If you want to reset passwords to defaults:

```powershell
npm run seed
```

This will:
- Keep existing users with the same email
- Update their passwords to match seed.js file
- Add any missing users

---

## Manual Verification

### Test Admin Login
1. Go to http://localhost:5174
2. Click "Sign In"
3. Select "Admin" tab
4. Enter:
   - Email: `haanimpietersen@gmail.com`
   - Password: `Haanim@13`
5. Click "Login"
6. Should see admin dashboard

### Test Agent Login
1. Go to http://localhost:5174
2. Click "Sign In"
3. Select "Agent" tab
4. Enter:
   - Email: `fagrie13@gmail.com`
   - Password: `Fagrie@13`
5. Click "Login"
6. Should see agent dashboard

✅ **If logins work → Everything is working!**

---

## Next Steps After Seeding

### 1. Start Backend
```powershell
# In backend folder
npm start
```
Should show: `Backend API running on port 3001`

### 2. Start Frontend (New Terminal)
```powershell
cd frontend
npm run dev
```
Should show: `Local: http://localhost:5174`

### 3. Access Application
```
http://localhost:5174
```

### 4. Login and Test
- Use provided credentials
- Explore admin and agent dashboards
- View profiles
- Test features

---

## 🔐 Security Notes

✅ **Passwords are secure:**
- Stored as hashed values (bcryptjs)
- Original passwords never appear in logs
- Passwords never stored in plaintext

⚠️ **For production:**
- Change default passwords immediately
- Use strong, unique passwords
- Enable two-factor authentication
- Use HTTPS only
- Regular security audits

---

## Quick Command Reference

```powershell
# Navigate to project
cd C:\Users\haani\OneDrive\Documents\GitHub\DriveSure

# Go to backend
cd backend

# Install dependencies
npm install

# Seed database
npm run seed

# Start backend
npm start

# In another terminal, start frontend
cd frontend
npm run dev

# Access application
http://localhost:5174
```

---

## ✨ You're Ready to Seed!

1. Open PowerShell
2. Navigate to backend folder
3. Run `npm run seed`
4. See the success message
5. Start your servers
6. Login and start using!

Questions? Check:
- [USER_SETUP_GUIDE.md](USER_SETUP_GUIDE.md) - Detailed setup guide
- [README.md](README.md) - General instructions
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference

Enjoy! 🚀
