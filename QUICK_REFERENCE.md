# 🚀 Quick Reference Card

## Setup in 3 Commands

```bash
# 1. Seed the database with admin and agent users
cd backend
npm run seed

# 2. Start backend (Terminal 1)
npm start

# 3. Start frontend (Terminal 2)
cd frontend
npm run dev
```

Then open: **http://localhost:5174**

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | haanimpietersen@gmail.com | Haanim@13 |
| **Agent** | fagrie13@gmail.com | Fagrie@13 |
| **Customer** | Register yourself | Your choice |

---

## 📍 Key URLs

| Page | URL |
|------|-----|
| Homepage | http://localhost:5174/ |
| Admin Dashboard | http://localhost:5174/admin |
| Admin Profile | http://localhost:5174/admin/profile |
| Agent Dashboard | http://localhost:5174/agent |
| Agent Profile | http://localhost:5174/agent/profile |
| Customer Dashboard | http://localhost:5174/customer |
| Customer Profile | http://localhost:5174/customer/profile |
| Backend API | http://localhost:3001 |

---

## 🎯 What to Test

### Admin Features
- [ ] Login as admin
- [ ] Click "👤 Profile" button
- [ ] View User Management tab
- [ ] View Review Approval tab
- [ ] View Support Messages tab
- [ ] Change password in Security tab

### Agent Features
- [ ] Login as agent
- [ ] Click "👤 Profile" button
- [ ] See statistics (total requests, completed, rating)
- [ ] View Assigned Requests tab
- [ ] View My Reviews tab
- [ ] Change password in Security tab

### Customer Features
- [ ] Sign up as customer
- [ ] Click "👤 Profile" button
- [ ] Upload profile picture
- [ ] View My Requests tab
- [ ] View My Reviews tab
- [ ] Leave review in dashboard
- [ ] Submit car request

---

## 🛠️ Common Tasks

### Re-seed Database
```bash
cd backend
npm run seed
```
This will update passwords and create users if they don't exist.

### Check if Port is In Use
```bash
# For port 3001 (backend)
netstat -ano | findstr :3001

# For port 5174 (frontend)
netstat -ano | findstr :5174
```

### Kill Process on Port
```bash
# Replace <PID> with the process ID from above
taskkill /PID <PID> /F
```

### Check Backend Health
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"Backend is running"}
```

---

## 💾 Database Credentials (from .env)

Check backend/.env:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=drivesure
```

### View Database
```bash
mysql -u root -p drivesure
SELECT id, first_name, email, role FROM users;
```

---

## 🎨 Important Styling Notes

| Role | Color | Header |
|------|-------|--------|
| Admin | Purple #8E44AD | Admin Control Panel |
| Agent | Green #27AE60 | Agent Dashboard |
| Customer | Blue #0052CC | Customer Dashboard |

---

## 📞 If Something Goes Wrong

### Backend won't start on port 3001
```bash
# Kill whatever is using port 3001
taskkill /PID <PID> /F
npm start
```

### Frontend won't start on port 5174
```bash
# Kill whatever is using port 5174
taskkill /PID <PID> /F
npm run dev
```

### MySQL connection error
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Ensure database exists
mysql -u root -p < backend/database-setup.sql
```

### Login fails
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check backend is running: http://localhost:3001/api/health
3. Verify email exactly matches (case-sensitive)
4. Check browser console (F12) for errors

---

## ✨ Files You Modified/Created

New files:
- `backend/seed.js` - Database seeding script
- `backend/routes/profile.js` - Profile API endpoints
- `frontend/src/pages/CustomerProfile.vue`
- `frontend/src/pages/AgentProfile.vue`
- `frontend/src/pages/AdminProfile.vue`
- `USER_SETUP_GUIDE.md` - Setup documentation
- `README.md` - Updated with instructions

Updated files:
- `backend/package.json` - Added seed script
- `backend/server.js` - Added profile routes
- `backend/database-setup.sql` - Added profile_picture column
- `frontend/src/main.js` - Added profile routes
- Dashboard files - Added Profile buttons

---

## 🎉 You're All Set!

Everything is ready to go. Just:

1. Run `npm run seed` in backend
2. Start backend with `npm start`
3. Start frontend with `npm run dev`
4. Open http://localhost:5174
5. Login and start testing!

---
