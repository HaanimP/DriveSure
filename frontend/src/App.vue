<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav>
      <div class="nav-logo" @click="$router.push('/')">Drive<span>Sure</span></div>
      <button class="hamburger-btn" id="hamburgerBtn" @click="toggleMobileNav">☰</button>
      <div class="nav-links" :class="{ open: mobileNavOpen }" id="navLinks">
        <a @click="scrollToHome">Home</a>
        <a @click="scrollToSection('plans')">Pricing</a>
        
        <!-- Show Dashboard and Profile only when logged in -->
        <a @click="handleDashboardClick('/customer')" v-if="currentUser && currentUser.role === 'customer'">Dashboard</a>
        <a @click="handleDashboardClick('/customer/profile')" v-if="currentUser && currentUser.role === 'customer'">Profile</a>
        <a @click="handleDashboardClick('/agent')" v-if="currentUser && (currentUser.role === 'agent' || currentUser.role === 'mechanic')">Dashboard</a>
        <a @click="handleDashboardClick('/agent/profile')" v-if="currentUser && (currentUser.role === 'agent' || currentUser.role === 'mechanic')">Profile</a>
        <a @click="handleDashboardClick('/admin')" v-if="currentUser && currentUser.role === 'admin'">Dashboard</a>
        <a @click="handleDashboardClick('/admin/profile')" v-if="currentUser && currentUser.role === 'admin'">Profile</a>
        
        <a @click="scrollToSection('contact')">Contact</a>
        
        <button class="nav-btn" @click="showLoginModal = true" v-if="!currentUser">Sign In</button>
        <button class="nav-btn" @click="handleLogout" v-if="currentUser">Sign Out</button>
      </div>
    </nav>

    <router-view @login="showLoginModal = true" />

    <!-- Footer -->
    <Footer />

    <!-- Login Modal -->
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" @login="handleLogin" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import LoginModal from './components/LoginModal.vue'
import Footer from './components/Footer.vue'

export default {
  components: { LoginModal, Footer },
  setup() {
    const router = useRouter()
    const showLoginModal = ref(false)
    const mobileNavOpen = ref(false)
    const currentUser = ref(JSON.parse(localStorage.getItem('driveSureUser') || 'null'))

    onMounted(() => {
    })

    const handleLogin = (user) => {
      currentUser.value = user
      showLoginModal.value = false
      mobileNavOpen.value = false
    }

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('driveSureUser')
      currentUser.value = null
      mobileNavOpen.value = false
      router.push('/')
    }

    const toggleMobileNav = () => {
      mobileNavOpen.value = !mobileNavOpen.value
    }


    const scrollToSection = (section) => {
      mobileNavOpen.value = false
      const elem = document.querySelector(`#${section}`)
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' })
      } else {
        // Not on home page, navigate home and then scroll
        router.push('/').then(() => {
          setTimeout(() => {
            const element = document.querySelector(`#${section}`)
            if (element) element.scrollIntoView({ behavior: 'smooth' })
          }, 500)
        })
      }
    }

    const scrollToHome = () => {
      mobileNavOpen.value = false
      router.push('/').then(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      })
    }

    const handleDashboardClick = (path) => {
      mobileNavOpen.value = false
      router.push(path)
    }

    return {
      showLoginModal,
      currentUser,
      mobileNavOpen,
      handleLogin,
      handleLogout,
      toggleMobileNav,
      scrollToSection,
      scrollToHome,
      handleDashboardClick
    }
  }
}
</script>

