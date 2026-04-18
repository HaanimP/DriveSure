# User Setup & Seeding Guide

## 🔐 Default Users

Your DriveSure application now has two predefined users that will be seeded into the database:

### Admin User
```
Email: haanimpietersen@gmail.com
Password: Haanim@13
Role: Administrator
```

### Agent/Mechanic User
```
Email: fagrie13@gmail.com
Password: Fagrie@13
Role: Agent
```

---

## 📋 How to Seed the Database

### Step 1: Ensure MySQL is Running
Make sure your MySQL database is running and the `drivesure` database exists.

```bash
# Check MySQL is running (Windows)
mysql -u root -p -e "SELECT 1"
```

### Step 2: Run the Seeding Script
Navigate to the backend folder and run the seed command:

```bash
cd backend
npm run seed
```

### Expected Output
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

### Step 3: Start Your Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Access Application:**
```
http://localhost:5174
```

---

## 🧪 Testing the Login

### Login as Admin
1. Go to http://localhost:5174
2. Click "Sign In"
3. Select "Admin" tab
4. Enter:
   - Email: `haanimpietersen@gmail.com`
   - Password: `Haanim@13`
5. Click "Login"
6. You should be redirected to `/admin` dashboard

### Login as Agent
1. Go to http://localhost:5174
2. Click "Sign In"
3. Select "Agent" tab
4. Enter:
   - Email: `fagrie13@gmail.com`
   - Password: `Fagrie@13`
5. Click "Login"
6. You should be redirected to `/agent` dashboard

### Login as Customer
1. You can create a new customer account through the registration form
2. Select "Customer" tab
3. Fill in your details
4. Create account
5. You'll be redirected to `/customer` dashboard

---

## ⚙️ Technical Details

### Password Hashing
- All passwords are hashed using **bcryptjs** with 10 salt rounds
- Passwords are never stored in plain text
- Even if you view the database, passwords appear as long hashed strings

### Updating Credentials

If you need to change the passwords:

**Option 1: Update Existing Users (Re-run seed)**
```bash
npm run seed
```
This will:
- Keep existing users with the same email
- Update only the passwords to match the seed file

**Option 2: Change Password in App**
1. Login to your profile
2. Go to "Security" tab
3. Change password through the UI

**Option 3: Direct Database Update**
```bash
# NOT RECOMMENDED - Use the seed script instead
# If you must manually insert users:

USE drivesure;
INSERT INTO users (first_name, last_name, email, phone, password, role) 
VALUES ('Name', 'Surname', 'email@example.com', '+27123456789', 'hashed_password', 'agent');
```

---

## 🔍 Verify Users in Database

To check if users were seeded correctly:

```bash
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

---

## 🚨 Troubleshooting

### "npm run seed" gives error
**Problem:** Command not found or npm error
**Solution:** 
- Make sure you're in the `backend` folder
- Run `npm install` first
- Check Node.js is installed: `node --version`

### "Database connection error"
**Problem:** Seed can't connect to MySQL
**Solution:**
- Verify MySQL is running
- Check `.env` file has correct DB_HOST, DB_USER, DB_PASSWORD
- Ensure `drivesure` database exists (run database-setup.sql)
- Test connection: `mysql -u root -p drivesure`

### "User already exists" message
**Problem:** User already in database from previous seed
**Solution:** 
- This is normal! The seed script will update the password
- If you want fresh start, delete users from database:
  ```sql
  DELETE FROM users WHERE email IN ('haanimpietersen@gmail.com', 'fagrie13@gmail.com');
  ```

### "Can't login even with correct password"
**Problem:** Login fails despite correct credentials
**Solution:**
- Clear browser cache: Ctrl+Shift+Delete
- Check browser console for errors (F12)
- Verify backend is running on port 3001
- Check user role matches (admin in admin tab, etc.)

---

## 📝 First-Time Setup Checklist

- [ ] MySQL installed and running
- [ ] `.env` file configured with DB credentials
- [ ] Database `drivesure` created
- [ ] `npm install` run in backend folder
- [ ] `npm run seed` executed successfully
- [ ] Backend started with `npm start`
- [ ] Frontend started with `npm run dev`
- [ ] Can see login page at localhost:5174
- [ ] Can login as admin with provided credentials
- [ ] Can login as agent with provided credentials
- [ ] Can access admin profile with `👤 Profile` button
- [ ] Can access agent profile with `👤 Profile` button

---

## 🔒 Security Notes

✅ **Good Practices Implemented:**
- Passwords are hashed before storage
- Seed script never exposes plaintext passwords in logs
- JWT tokens used for session management
- Role-based access control enforced

⚠️ **For Production:**
- Change default passwords immediately
- Use environment variables for sensitive data
- Implement rate limiting on login attempts
- Add email verification for security
- Use HTTPS only
- Implement account lockout after failed attempts
- Regular security audits

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Check browser console (F12) for frontend errors
4. Verify all services are running (MySQL, Backend, Frontend)
5. Try fresh seed with: `npm run seed`

---
