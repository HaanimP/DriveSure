# 🚗 DriveSure Setup Instructions

## ⚡ Quick Start (5 minutes)

### 1. Database Setup
```bash
# Make sure MySQL is running
mysql -u root -p -e "USE drivesure; SELECT 1;"

# If database doesn't exist, create it:
mysql -u root -p < backend/database-setup.sql
```

### 2. Seed Default Users
```bash
cd backend
npm install          # If first time
npm run seed        # Creates admin and agent users
```

✅ **Expected Output:**
```
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

### 3. Start Backend
```bash
# Terminal 1
cd backend
npm start
# Shows: Backend API running on port 3001
```

### 4. Start Frontend
```bash
# Terminal 2
cd frontend
npm install          # If first time
npm run dev
# Shows: Local: http://localhost:5174
```

### 5. Access Application
```
http://localhost:5174
```

---

## 🔐 Login Credentials

### Admin Account
- **Email:** haanimpietersen@gmail.com
- **Password:** Haanim@13
- **Role:** Administrator
- **Access:** Manage users, approve reviews, support messages

### Agent Account
- **Email:** fagrie13@gmail.com
- **Password:** Fagrie@13
- **Role:** Mechanic/Agent
- **Access:** View assigned requests, see customer ratings

### Customer Account
- **Sign Up:** Create your own through registration
- **Access:** Submit car requests, leave reviews, view status

---

## 📂 Project Structure

```
DriveSure/
├── backend/                          # Node.js Express API
│   ├── server.js                    # Main server file
│   ├── config.js                    # MySQL configuration
│   ├── seed.js                      # Database seeding script
│   ├── routes/                      # API endpoints
│   │   ├── auth.js                 # Login/Register
│   │   ├── profile.js              # User profiles
│   │   ├── requests.js             # Car requests
│   │   ├── reviews.js              # Reviews
│   │   └── contact.js              # Contact form
│   ├── database-setup.sql           # Database schema
│   ├── .env                         # Configuration
│   └── package.json
│
├── frontend/                         # Vue.js Application
│   ├── src/
│   │   ├── App.vue                 # Root component
│   │   ├── main.js                 # Router setup
│   │   ├── style.css               # Global styles
│   │   ├── api.js                  # API client
│   │   ├── pages/                  # Full pages
│   │   │   ├── Landing.vue         # Homepage
│   │   │   ├── CustomerDashboard.vue
│   │   │   ├── AgentDashboard.vue
│   │   │   ├── AdminDashboard.vue
│   │   │   ├── CustomerProfile.vue
│   │   │   ├── AgentProfile.vue
│   │   │   └── AdminProfile.vue
│   │   └── components/             # Reusable components
│   ├── index.html
│   └── package.json
│
├── README.md                        # This file
├── USER_SETUP_GUIDE.md             # Detailed setup guide
├── PROFILE_QUICK_START.md          # Profile features
├── PROFILE_IMPLEMENTATION_SUMMARY.md
└── .env                            # Environment config
```

---

## 🔧 Tech Stack

**Frontend:**
- Vue.js 3.3.4
- Vue Router 4.2.1
- Vite 4.5.14 (build tool)
- Axios 1.4.0 (HTTP client)

**Backend:**
- Node.js 24.13.1
- Express.js (web framework)
- MySQL 8.0 (database)
- JWT (authentication)
- bcryptjs (password hashing)

**Development:**
- Windows 10
- npm package manager

---

## 🎯 Key Features

### ✨ Homepage
- Professional hero section with CTA
- 3 pricing plans (Basic/Standard/Platinum)
- Customer testimonials
- Contact form

### 👥 Three User Roles
**Admin**
- Manage platform users
- Approve customer reviews
- View support messages
- System statistics

**Agent/Mechanic**
- View assigned customer requests
- See customer ratings
- Manage personal profile
- Job statistics

**Customer**
- Submit car requests
- View request status
- Leave reviews
- Personal profile management

### 📊 User Profiles
- Upload profile pictures
- Edit personal information
- Change password securely
- Role-specific dashboards
- Statistics and analytics

---

## 🚀 Common Commands

### Backend
```bash
cd backend
npm start                # Start production server
npm run dev             # Start with auto-reload
npm run seed            # Seed database with default users
npm install             # Install dependencies
```

### Frontend
```bash
cd frontend
npm run dev             # Start dev server (localhost:5174)
npm run build           # Build for production
npm install             # Install dependencies
```

---

## 🗄️ Database

### Tables
- **users** - User accounts with roles
- **requests** - Car requests from customers
- **reviews** - Customer reviews/ratings
- **contact_messages** - Contact form submissions

### Setup
```bash
# Create database and tables
mysql -u root -p < backend/database-setup.sql

# Seed default users
cd backend
npm run seed
```

---

## 🔐 Authentication & Security

- **Password Hashing:** bcryptjs (10 rounds)
- **Session:** JWT tokens (7-day expiration)
- **Authorization:** Role-based access control
- **CORS:** Enabled for secure API access
- **Token Storage:** localStorage (frontend)

---

## 🎨 Styling

- **Color Scheme:** Blue, White, Red
- **Design System:** Modern glassmorphism
- **Animations:** Smooth transitions and hover effects
- **Responsive:** Mobile, tablet, desktop
- **Fonts:** Bebas Neue (headers), DM Sans (body)

---

## 📱 Responsive Breakpoints

- **Desktop:** Full width (1200px+)
- **Tablet:** 768px breakpoint
- **Mobile:** 480px breakpoint

---

## 🧪 Testing

### Test Admin Account
1. Click "Sign In" → Select "Admin" tab
2. Email: `haanimpietersen@gmail.com`
3. Password: `Haanim@13`
4. Access admin dashboard and profile

### Test Agent Account
1. Click "Sign In" → Select "Agent" tab
2. Email: `fagrie13@gmail.com`
3. Password: `Fagrie@13`
4. Access agent dashboard and profile

### Test Customer Account
1. Click "Sign In" → Select "Customer" tab
2. Register with your email
3. Create car request
4. Leave a review

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process on port 3001
taskkill /PID <pid> /F

# Try again
npm start
```

### Frontend won't start
```bash
# Check if port 5174 is in use
netstat -ano | findstr :5174

# Clear node modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### Database connection error
- Verify MySQL is running
- Check `.env` file credentials
- Ensure database exists: `mysql -u root -p drivesure`

### Login fails
- Clear browser cache (Ctrl+Shift+Delete)
- Check backend is running on port 3001
- Verify user email and password match seeded credentials
- Check browser console (F12) for errors

---

## 📚 Documentation

- **[USER_SETUP_GUIDE.md](USER_SETUP_GUIDE.md)** - Detailed setup and seeding
- **[PROFILE_QUICK_START.md](PROFILE_QUICK_START.md)** - Profile page features
- **[PROFILE_PAGES_GUIDE.md](PROFILE_PAGES_GUIDE.md)** - Complete profile documentation

---

## 🎯 Next Steps

1. ✅ Run `npm run seed` to create admin and agent users
2. ✅ Start both backend and frontend servers
3. ✅ Login with provided credentials
4. ✅ Explore the application
5. ✅ Test profile page features
6. 📝 Create customer accounts for testing
7. 🚀 Deploy to production (optional)

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Check browser console for errors (F12)
3. Check backend terminal for server errors
4. Review documentation files in this folder
5. Verify all services are running properly

---

## ✨ You're Ready!

Your DriveSure vehicle sourcing platform is fully set up and ready to use.

**Start the application:**
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev

# Terminal 3
Open: http://localhost:5174
```

**Login with:**
- Admin: `haanimpietersen@gmail.com` / `Haanim@13`
- Agent: `fagrie13@gmail.com` / `Fagrie@13`

Enjoy! 🚀
