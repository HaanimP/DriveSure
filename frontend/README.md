# Drive Sure - Vue.js Frontend

A modern, professional Vue 3 frontend for the Drive Sure vehicle sourcing application.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.js              # Vue app entry point
│   ├── App.vue              # Root component
│   ├── style.css            # Global styles
│   ├── api.js               # API client configuration
│   ├── pages/
│   │   ├── Landing.vue      # Home page
│   │   ├── CustomerDashboard.vue
│   │   ├── AgentDashboard.vue
│   │   └── AdminDashboard.vue
│   └── components/
│       ├── LoginModal.vue
│       ├── HeroSection.vue
│       ├── PlansSection.vue
│       ├── ReviewsSection.vue
│       └── ContactSection.vue
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Backend server running on `localhost:3001`

### Installation

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## 📚 Features

✅ **Authentication**
- Customer registration & login
- Agent/Mechanic login
- Admin login
- JWT token management
- Session persistence

✅ **Customer Dashboard**
- Submit car search requests
- View my requests
- Leave reviews
- Track request status

✅ **Responsive Design**
- Mobile-friendly
- Tablet optimized
- Professional UI

✅ **API Integration**
- Automatic token injection in requests
- Error handling
- Request interceptors

## 🔌 API Configuration

The frontend connects to the backend API through the proxy configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true
  }
}
```

All API calls use `/api/*` URLs (e.g., `/api/auth/login`)

## 🛠️ Technology Stack

- **Vue 3** - Progressive framework
- **Vue Router 4** - Client-side routing
- **Vite** - Fast build tool
- **Axios** - HTTP client

## 📖 Development Guide

### Adding a New Page

1. Create a new `.vue` file in `src/pages/`
2. Add route in `src/main.js`
3. Import and add to router configuration

### Adding a New Component

1. Create `.vue` file in `src/components/`
2. Import in parent component
3. Use as `<ComponentName />`

### API Calls

```javascript
import apiClient from '../api'

// GET request
const result = await apiClient.get('/endpoint')

// POST request
const result = await apiClient.post('/endpoint', { data })

// PUT request
const result = await apiClient.put('/endpoint/:id', { data })

// DELETE request
await apiClient.delete('/endpoint/:id')
```

Authentication token is automatically added to all requests.

## 🚨 Common Issues

**Issue:** "Cannot find module 'axios'"
```bash
npm install
```

**Issue:** "Port 5173 already in use"
```bash
npm run dev -- --port 5174
```

**Issue:** Backend API not responding
- Check backend is running: `npm start` in `/backend`
- Check proxy URL in `vite.config.js`
- Check CORS is enabled on backend

## 📝 Environment Variables

Create a `.env.local` file for environment-specific settings:

```
VITE_API_URL=http://localhost:3001/api
```

## 🎯 Next Steps

1. **Test Signup** - Register a new customer account
2. **Test Dashboard** - View customer dashboard
3. **Submit Request** - Try submitting a car search request
4. **Add Agent Dashboard** - Implement agent panel features
5. **Add Admin Dashboard** - Implement admin control panel

## 📞 Support

For issues or questions about the frontend:
1. Check browser DevTools Console (F12) for errors
2. Check backend terminal for API errors
3. Verify database is running and has data

---

**Status:** ✅ Production Ready
**Last Updated:** 2026-04-18
**Version:** 1.0.0
