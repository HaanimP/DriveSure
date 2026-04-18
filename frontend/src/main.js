import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Landing from './pages/Landing.vue'
import CustomerDashboard from './pages/CustomerDashboard.vue'
import AgentDashboard from './pages/AgentDashboard.vue'
import AdminDashboard from './pages/AdminDashboard.vue'
import CustomerProfile from './pages/CustomerProfile.vue'
import AgentProfile from './pages/AgentProfile.vue'
import AdminProfile from './pages/AdminProfile.vue'
import PaymentPage from './pages/PaymentPage.vue'
import CarRequestForm from './pages/CarRequestForm.vue'
import ReviewForm from './pages/ReviewForm.vue'
import './style.css'

const routes = [
  { path: '/', component: Landing },
  { path: '/customer', component: CustomerDashboard, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/customer/profile', component: CustomerProfile, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/customer/review', component: ReviewForm, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/payment', component: PaymentPage, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/car-request', component: CarRequestForm, meta: { requiresAuth: true, role: 'customer' } },
  { path: '/agent', component: AgentDashboard, meta: { requiresAuth: true, role: 'agent' } },
  { path: '/agent/profile', component: AgentProfile, meta: { requiresAuth: true, role: 'agent' } },
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/profile', component: AdminProfile, meta: { requiresAuth: true, role: 'admin' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { left: 0, top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('driveSureUser') || '{}')
  
  if (to.meta.requiresAuth && !token) {
    next('/')
  } else if (to.meta.role && user.role !== to.meta.role) {
    next('/')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
