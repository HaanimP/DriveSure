<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="modal-close" @click="$emit('close')">&times;</button>
      <h2>Welcome Back</h2>
      <p class="modal-subtitle">Sign in or create a customer account</p>

      <div class="tabs">
        <button 
          v-for="tab in ['customer', 'agent', 'admin']"
          :key="tab"
          class="tab-button"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
        </button>
      </div>

      <!-- Customer Tab -->
      <div v-if="activeTab === 'customer'">
        <div v-if="!showRegister">
          <div class="form-group">
            <label>Email</label>
            <input v-model="loginForm.email" type="email" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="loginForm.password" type="password" placeholder="••••••••">
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <button @click="login" class="btn btn-primary">Sign In</button>
          <p class="switch-link">New here? <a @click="showRegister = true">Create an account</a></p>
        </div>

        <div v-else>
          <div class="form-group">
            <label>First Name</label>
            <input v-model="registerForm.first_name" placeholder="Jane">
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input v-model="registerForm.last_name" placeholder="Smith">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="registerForm.email" type="email" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="registerForm.phone" placeholder="071 000 0000">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="registerForm.password" type="password" placeholder="Choose a password">
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <button @click="register" class="btn btn-primary">Create Account</button>
          <p class="switch-link">Already have an account? <a @click="showRegister = false">Sign in</a></p>
        </div>
      </div>

      <!-- Agent Tab -->
      <div v-if="activeTab === 'agent'">
        <div class="alert alert-warning">Agent & Mechanic access is managed by admin. Contact support if needed.</div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="agentForm.email" placeholder="agent@email.com">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="agentForm.password" type="password" placeholder="••••••••">
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button @click="loginAgent" class="btn btn-secondary">Agent Sign In</button>
      </div>

      <!-- Admin Tab -->
      <div v-if="activeTab === 'admin'">
        <div class="form-group">
          <label>Admin Email</label>
          <input v-model="adminForm.email" placeholder="admin@email.com">
        </div>
        <div class="form-group">
          <label>Admin Password</label>
          <input v-model="adminForm.password" type="password" placeholder="••••••••">
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button @click="loginAdmin" class="btn btn-primary" style="background: #7c3aed;">Admin Sign In</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import apiClient from '../api'

export default {
  emits: ['close', 'login'],
  setup(props, { emit }) {
    const activeTab = ref('customer')
    const showRegister = ref(false)
    const error = ref('')
    
    const loginForm = ref({ email: '', password: '' })
    const registerForm = ref({ first_name: '', last_name: '', email: '', phone: '', password: '' })
    const agentForm = ref({ email: '', password: '' })
    const adminForm = ref({ email: '', password: '' })

    const login = async () => {
      try {
        error.value = ''
        const result = await apiClient.post('/auth/login', {
          email: loginForm.value.email,
          password: loginForm.value.password
        })
        
        localStorage.setItem('token', result.token)
        localStorage.setItem('driveSureUser', JSON.stringify(result.user))
        emit('login', result.user)
      } catch (err) {
        error.value = err.message || 'Login failed'
      }
    }

    const register = async () => {
      try {
        error.value = ''
        const result = await apiClient.post('/auth/register', {
          first: registerForm.value.first_name,
          last: registerForm.value.last_name,
          email: registerForm.value.email,
          phone: registerForm.value.phone,
          password: registerForm.value.password
        })
        
        localStorage.setItem('token', result.token)
        localStorage.setItem('driveSureUser', JSON.stringify(result.user))
        emit('login', result.user)
      } catch (err) {
        error.value = err.message || 'Registration failed'
      }
    }

    const loginAgent = async () => {
      try {
        error.value = ''
        const result = await apiClient.post('/auth/login', {
          email: agentForm.value.email,
          password: agentForm.value.password
        })
        
        localStorage.setItem('token', result.token)
        localStorage.setItem('driveSureUser', JSON.stringify(result.user))
        emit('login', result.user)
      } catch (err) {
        error.value = err.message || 'Login failed'
      }
    }

    const loginAdmin = async () => {
      try {
        error.value = ''
        const result = await apiClient.post('/auth/login', {
          email: adminForm.value.email,
          password: adminForm.value.password
        })
        
        localStorage.setItem('token', result.token)
        localStorage.setItem('driveSureUser', JSON.stringify(result.user))
        emit('login', result.user)
      } catch (err) {
        error.value = err.message || 'Login failed'
      }
    }

    return {
      activeTab,
      showRegister,
      error,
      loginForm,
      registerForm,
      agentForm,
      adminForm,
      login,
      register,
      loginAgent,
      loginAdmin
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.modal-close:hover {
  color: #000;
}

h2 {
  margin-bottom: 0.5rem;
  color: var(--blue);
}

.modal-subtitle {
  color: #999;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  color: #999;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: var(--blue);
  border-bottom-color: var(--blue);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: var(--text);
}

.error {
  color: var(--red);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.switch-link {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.switch-link a {
  color: var(--blue);
  cursor: pointer;
  text-decoration: underline;
}

.alert {
  margin-bottom: 1rem;
}

@media (max-width: 600px) {
  .modal {
    width: 95%;
    padding: 1.5rem;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1;
    min-width: 100px;
  }
}
</style>
