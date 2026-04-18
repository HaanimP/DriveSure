<template>
  <div class="review-form-page">
    <div class="form-container">
      <button class="back-btn" @click="$router.back()">← Back</button>
      
      <div class="form-header">
        <h1>Share Your Experience</h1>
        <p>Help other customers by leaving an honest review</p>
      </div>

      <form @submit.prevent="submitReview" class="review-form">
        <!-- Rating Section -->
        <div class="form-section">
          <label class="form-label">Your Rating *</label>
          <div class="star-rating-selector">
            <button 
              v-for="n in 5" 
              :key="n"
              type="button"
              @click="reviewForm.stars = n"
              class="star-btn"
              :class="{ active: n <= reviewForm.stars }"
            >
              ⭐
            </button>
          </div>
          <p v-if="reviewForm.stars > 0" class="rating-label">
            {{ ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.stars - 1] }}
          </p>
        </div>

        <!-- Plan Selection -->
        <div class="form-section">
          <label class="form-label">Which Plan Did You Use? *</label>
          <div class="plan-options">
            <label v-for="plan in ['Basic', 'Premium', 'Platinum']" :key="plan" class="plan-checkbox">
              <input 
                type="radio" 
                :value="plan" 
                v-model="reviewForm.plan"
                required
              >
              <span>{{ plan }}</span>
            </label>
          </div>
        </div>

        <!-- Review Text -->
        <div class="form-section">
          <label class="form-label">Your Review *</label>
          <textarea 
            v-model="reviewForm.text"
            placeholder="Share your experience with DriveSure... What was great? What could be improved?"
            rows="6"
            required
            maxlength="500"
            class="review-textarea"
          ></textarea>
          <div class="char-count">{{ reviewForm.text.length }}/500</div>
        </div>

        <!-- Buttons -->
        <div class="form-actions">
          <button type="button" @click="$router.back()" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !reviewForm.stars || !reviewForm.text">
            {{ loading ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>

        <!-- Messages -->
        <div v-if="successMessage" class="success-message">
          <span>✓</span>
          <div>
            <p class="message-title">Review Submitted!</p>
            <p class="message-text">{{ successMessage }}</p>
          </div>
        </div>
        <div v-if="errorMessage" class="error-message">
          <span>✕</span>
          <div>
            <p class="message-title">Error</p>
            <p class="message-text">{{ errorMessage }}</p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api'

const router = useRouter()
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const reviewForm = ref({
  stars: 0,
  plan: 'Premium',
  text: ''
})

const submitReview = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    if (!reviewForm.value.stars) {
      errorMessage.value = 'Please select a rating'
      return
    }

    if (!reviewForm.value.text.trim()) {
      errorMessage.value = 'Please write your review'
      return
    }

    loading.value = true

    const userData = JSON.parse(localStorage.getItem('driveSureUser') || '{}')
    console.log('👤 User Data:', userData)
    
    if (!userData.id) {
      errorMessage.value = 'User information not found. Please log in again.'
      console.warn('⚠️ No user ID found')
      return
    }

    const reviewData = {
      userId: userData.id,
      userName: userData.first || 'Anonymous',
      stars: reviewForm.value.stars,
      text: reviewForm.value.text,
      plan: reviewForm.value.plan
    }

    console.log('📝 Submitting review data:', reviewData)
    const response = await apiClient.post('/reviews', reviewData)
    console.log('✅ Review submission response:', response)
    
    successMessage.value = 'Thank you! Your review has been posted.'
    
    setTimeout(() => {
      router.push('/')
      setTimeout(() => {
        const element = document.querySelector('#reviews')
        if (element) element.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }, 1500)
  } catch (err) {
    console.error('❌ Error submitting review:', err)
    console.error('❌ Error details:', { message: err.message, status: err.response?.status, data: err.response?.data })
    errorMessage.value = err.message || 'Failed to submit review. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-form-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem;
  padding-top: 100px;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 2rem;
  font-weight: 600;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #93c5fd;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h1 {
  color: #ffffff;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.form-header p {
  color: #cbd5e1;
  margin: 0;
}

.review-form {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-of-type {
  margin-bottom: 2.5rem;
}

.form-label {
  display: block;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.star-rating-selector {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.star-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 2rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star-btn:hover {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.star-btn.active {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
}

.rating-label {
  color: #fbbf24;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}

.plan-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.plan-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-checkbox:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
}

.plan-checkbox input[type="radio"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.plan-checkbox span {
  color: #ffffff;
  font-weight: 500;
}

.plan-checkbox input[type="radio"]:checked + span {
  color: #60a5fa;
}

.review-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s;
}

.review-textarea:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(255, 255, 255, 0.08);
}

.review-textarea::placeholder {
  color: #94a3b8;
}

.char-count {
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.success-message {
  display: flex;
  gap: 1rem;
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #34d399;
}

.success-message span {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.error-message {
  display: flex;
  gap: 1rem;
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #f87171;
}

.error-message span {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.message-title {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.message-text {
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 1024px) {
  .review-form-page {
    padding: 2rem 1.5rem;
    padding-top: 90px;
  }

  .form-header h1 {
    font-size: 1.8rem;
  }

  .review-form {
    padding: 1.75rem;
  }

  .star-rating-selector {
    gap: 0.85rem;
  }

  .star-btn {
    width: 50px;
    height: 50px;
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .review-form-page {
    padding: 1.25rem;
    padding-top: 75px;
  }

  .form-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .form-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .form-header p {
    font-size: 0.9rem;
  }

  .review-form {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .form-section {
    margin-bottom: 1.5rem;
  }

  .form-section h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .form-section p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .star-rating-selector {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .star-btn {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
    border-radius: 8px;
  }

  .rating-feedback {
    font-size: 0.9rem;
    padding: 0.75rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
  }

  .form-group select, .form-group input {
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .review-textarea {
    padding: 0.85rem;
    font-size: 0.9rem;
    min-height: 100px;
  }

  .char-count {
    font-size: 0.75rem;
    margin-top: 0.35rem;
  }

  .form-actions {
    flex-direction: row;
    gap: 0.85rem;
    margin-bottom: 1.25rem;
  }

  .btn {
    padding: 0.85rem;
    font-size: 0.95rem;
    border-radius: 8px;
  }

  .success-message, .error-message {
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .success-message span, .error-message span {
    font-size: 1.3rem;
  }

  .message-title {
    font-size: 0.95rem;
  }

  .message-text {
    font-size: 0.85rem;
  }
}

@media (max-width: 600px) {
  .review-form-page {
    padding: 1rem;
    padding-top: 65px;
  }

  .form-header h1 {
    font-size: 1.25rem;
  }

  .form-header p {
    font-size: 0.85rem;
  }

  .review-form {
    padding: 1.25rem;
    border-radius: 10px;
  }

  .form-section {
    margin-bottom: 1.25rem;
  }

  .form-section h2 {
    font-size: 1rem;
    margin-bottom: 0.85rem;
  }

  .form-section p {
    font-size: 0.85rem;
    margin-bottom: 0.85rem;
  }

  .star-rating-selector {
    gap: 0.6rem;
    margin-bottom: 1.25rem;
  }

  .star-btn {
    width: 44px;
    height: 44px;
    font-size: 1.3rem;
  }

  .rating-feedback {
    font-size: 0.85rem;
    padding: 0.65rem;
    border-radius: 6px;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }

  .form-group select, .form-group input {
    padding: 0.65rem;
    font-size: 0.9rem;
  }

  .review-textarea {
    padding: 0.7rem;
    font-size: 0.85rem;
    min-height: 90px;
  }

  .char-count {
    font-size: 0.7rem;
    margin-top: 0.3rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.65rem;
  }

  .btn {
    padding: 0.7rem;
    font-size: 0.9rem;
  }

  .success-message, .error-message {
    gap: 0.65rem;
    padding: 0.85rem;
    border-radius: 8px;
  }

  .success-message span, .error-message span {
    font-size: 1.2rem;
  }

  .message-title {
    font-size: 0.9rem;
  }

  .message-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 400px) {
  .review-form-page {
    padding: 0.75rem;
    padding-top: 60px;
  }

  .form-header h1 {
    font-size: 1.1rem;
  }

  .form-header p {
    font-size: 0.8rem;
  }

  .review-form {
    padding: 1rem;
  }

  .star-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .form-group select, .form-group input {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .review-textarea {
    padding: 0.6rem;
    font-size: 0.8rem;
    min-height: 80px;
  }

  .btn {
    padding: 0.6rem;
    font-size: 0.85rem;
  }
}
</style>
