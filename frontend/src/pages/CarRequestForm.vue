<template>
  <div class="request-page">
    <div class="request-container">
      <button class="back-btn" @click="goBack">← Back</button>

      <div class="request-content">
        <div class="request-header">
          <h1>Specify Your Vehicle Details</h1>
          <p>Tell us about the vehicle you're looking for</p>
        </div>

        <form @submit.prevent="submitRequest" class="request-form">
          <div class="form-section">
            <h2>🚗 Vehicle Requirements</h2>

            <div class="form-group">
              <label>Car Type *</label>
              <select v-model="form.car_type" required>
                <option value="">Select car type</option>
                <option value="car">Car</option>
                <option value="bakkie">Bakkie</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Make/Brand *</label>
                <input v-model="form.make" type="text" placeholder="e.g., Toyota" required>
              </div>
              <div class="form-group">
                <label>Year Range *</label>
                <input v-model="form.year_range" type="text" placeholder="e.g., 2018-2022" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Budget Min (R) *</label>
                <input v-model.number="form.budget_min" type="number" placeholder="e.g., 100000" required>
              </div>
              <div class="form-group">
                <label>Budget Max (R) *</label>
                <input v-model.number="form.budget_max" type="number" placeholder="e.g., 500000" required>
              </div>
            </div>

            <div class="form-group">
              <label>Location/Area *</label>
              <input v-model="form.area" type="text" placeholder="e.g., Johannesburg, Cape Town" required>
            </div>
          </div>

          <div class="form-section">
            <h2>📝 Additional Information</h2>

            <div class="form-group">
              <label>Additional Notes</label>
              <textarea v-model="form.notes" placeholder="Any specific requirements or preferences?" rows="4"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="goBack">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>

          <p v-if="error" class="error-message">{{ error }}</p>
          <p v-if="success" class="success-message">{{ success }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api'

export default {
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    const form = ref({
      car_type: '',
      make: '',
      year_range: '',
      budget_min: '',
      budget_max: '',
      area: '',
      notes: ''
    })

    const submitRequest = async () => {
      try {
        error.value = ''
        success.value = ''

        console.log('🔍 DEBUG: Current form values:', {
          car_type: form.value.car_type,
          car_type_type: typeof form.value.car_type,
          make: form.value.make,
          make_type: typeof form.value.make,
          year_range: form.value.year_range,
          year_range_type: typeof form.value.year_range,
          budget_min: form.value.budget_min,
          budget_min_type: typeof form.value.budget_min,
          budget_max: form.value.budget_max,
          budget_max_type: typeof form.value.budget_max,
          area: form.value.area,
          area_type: typeof form.value.area,
          notes: form.value.notes
        })

        // Validate all required fields
        if (!form.value.car_type) {
          error.value = 'Please select a car type'
          console.log('❌ Validation failed: car_type is empty')
          return
        }
        if (!form.value.make) {
          error.value = 'Please enter the car make/brand'
          console.log('❌ Validation failed: make is empty')
          return
        }
        if (!form.value.year_range) {
          error.value = 'Please enter the year range'
          console.log('❌ Validation failed: year_range is empty')
          return
        }
        if (!form.value.budget_min || form.value.budget_min <= 0) {
          error.value = 'Please enter a valid minimum budget'
          console.log('❌ Validation failed: budget_min invalid -', form.value.budget_min)
          return
        }
        if (!form.value.budget_max || form.value.budget_max <= 0) {
          error.value = 'Please enter a valid maximum budget'
          console.log('❌ Validation failed: budget_max invalid -', form.value.budget_max)
          return
        }
        if (form.value.budget_max < form.value.budget_min) {
          error.value = 'Maximum budget must be greater than minimum budget'
          console.log('❌ Validation failed: budget_max < budget_min')
          return
        }
        if (!form.value.area) {
          error.value = 'Please enter your location/area'
          console.log('❌ Validation failed: area is empty')
          return
        }

        console.log('✅ All frontend validations passed')
        loading.value = true

        const userData = JSON.parse(localStorage.getItem('driveSureUser') || '{}')
        const plan = sessionStorage.getItem('selectedPlan') || 'Premium'

        console.log('👤 User data:', userData)
        console.log('📦 Plan from session:', plan)

        if (!userData.id) {
          error.value = 'User information not found. Please log in again.'
          console.log('❌ Validation failed: no user id')
          return
        }

        const requestData = {
          user_id: userData.id,
          car_type: form.value.car_type,
          make: form.value.make,
          year_range: form.value.year_range,
          budget_min: Number(form.value.budget_min),
          budget_max: Number(form.value.budget_max),
          area: form.value.area,
          plan: plan,
          notes: form.value.notes
        }

        console.log('📋 COMPLETE request data:', JSON.stringify(requestData, null, 2))
        const result = await apiClient.post('/requests', requestData)
        console.log('✅ Request response:', result)

        success.value = '✅ Your request has been submitted successfully! Our agents will contact you soon.'
        
        setTimeout(() => {
          router.push('/customer')
        }, 2000)
      } catch (err) {
        console.error('❌ Request submission error:', err)
        console.error('Full error object:', err.response || err)
        const errorMessage = err.response?.data?.error || err.message || 'Failed to submit request'
        const missingFields = err.response?.data?.missingFields
        if (missingFields && missingFields.length > 0) {
          error.value = `Missing fields: ${missingFields.join(', ')}`
          console.log('Backend says missing:', missingFields)
        } else {
          error.value = errorMessage
        }
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.back()
    }

    return {
      form,
      loading,
      error,
      success,
      submitRequest,
      goBack
    }
  }
}
</script>

<style scoped>
.request-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #0d1f3c 0%, #1a3a6b 50%, #0d1f3c 100%);
  padding: 2rem;
  padding-top: 100px;
}

body.dark-mode .request-page {
  background: linear-gradient(160deg, #0f0f0f 0%, #1a2a3a 50%, #0f0f0f 100%);
}

.request-container {
  max-width: 700px;
  margin: 0 auto;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: all 0.3s;
  font-family: 'DM Sans', sans-serif;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.request-content {
  animation: slideUp 0.6s ease;
}

.request-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.request-header h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.request-header p {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

.request-form {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-med);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--gray-light);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  color: var(--text);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.85rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1a3a6b;
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'DM Sans', sans-serif;
}

.btn-primary {
  background: #1a3a6b;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0d1f3c;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 58, 107, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #1a3a6b;
  border: 2px solid #1a3a6b;
}

.btn-secondary:hover {
  background: #f0f4ff;
  transform: translateY(-2px);
}

.error-message {
  color: #c0392b;
  margin-top: 1rem;
  padding: 1rem;
  background: #fee2e2;
  border-radius: 8px;
  border-left: 4px solid #c0392b;
}

.success-message {
  color: #16a34a;
  margin-top: 1rem;
  padding: 1rem;
  background: #dcfce7;
  border-radius: 8px;
  border-left: 4px solid #16a34a;
}

@media (max-width: 1024px) {
  .request-form {
    padding: 2rem 1.5rem;
  }

  .form-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 0.8rem;
    font-size: 0.95rem;
  }

  .form-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
    margin-top: 1.5rem;
  }
}

@media (max-width: 768px) {
  .request-form {
    padding: 1.5rem;
    padding-top: 90px;
  }

  .request-header {
    margin-bottom: 1.5rem;
  }

  .request-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .request-header p {
    font-size: 0.9rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
    padding: 1.25rem;
  }

  .form-section h2 {
    font-size: 1.2rem;
    margin-bottom: 1.25rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 0.75rem;
    font-size: 0.95rem;
    border-radius: 6px;
  }

  .form-group textarea {
    min-height: 90px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-actions {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .btn-primary, .btn-secondary {
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .error-message, .success-message {
    padding: 0.9rem;
    font-size: 0.9rem;
    margin-top: 0.85rem;
  }
}

@media (max-width: 600px) {
  .request-form {
    padding: 1rem;
    padding-top: 75px;
  }

  .request-header {
    margin-bottom: 1.25rem;
  }

  .request-header h1 {
    font-size: 1.25rem;
  }

  .request-header p {
    font-size: 0.85rem;
  }

  .form-section {
    margin-bottom: 1.25rem;
    padding: 1rem;
    border-radius: 8px;
  }

  .form-section h2 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 0.65rem;
    font-size: 0.9rem;
  }

  .form-group textarea {
    min-height: 85px;
  }

  .form-row {
    gap: 0.5rem;
  }

  .form-actions {
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-primary, .btn-secondary {
    padding: 0.65rem;
    font-size: 0.9rem;
  }

  .error-message, .success-message {
    padding: 0.8rem;
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }
}

@media (max-width: 400px) {
  .request-form {
    padding: 0.75rem;
    padding-top: 65px;
  }

  .request-header h1 {
    font-size: 1.1rem;
  }

  .form-section {
    padding: 0.85rem;
    margin-bottom: 1rem;
  }

  .form-section h2 {
    font-size: 0.95rem;
  }

  .form-group {
    margin-bottom: 0.85rem;
  }

  .form-group label {
    font-size: 0.8rem;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 0.6rem;
    font-size: 0.85rem;
    border-radius: 6px;
  }

  .btn-primary, .btn-secondary {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
