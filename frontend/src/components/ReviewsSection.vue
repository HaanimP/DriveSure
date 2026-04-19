<template>
  <section class="reviews-bg" id="reviews">
    <div class="container">
      <div style="padding: 3rem 0;">
        <div class="section-header">
          <div class="section-tag">⭐ CUSTOMER REVIEWS</div>
          <h2 class="section-title">What Our Customers Say</h2>
          <p class="section-subtitle">Real feedback from satisfied clients using DriveSure</p>
        </div>

        <!-- Reviews Carousel -->
        <div v-if="reviews.length > 0" class="carousel-container">
          <div class="reviews-carousel">
            <div v-for="(review, index) in reviews" 
                 :key="`review-${review.id}`"
                 class="review-card"
                 :class="{ active: index === currentReviewIndex }"
                 :data-review-id="review.id"
                 :data-review-index="index">
              <div class="review-content">
                <div class="stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.stars }">⭐</span>
                </div>
                <p class="review-text">"{{ review.text }}"</p>
                <div class="review-author">
                  <div class="review-avatar">{{ review.user_name.charAt(0).toUpperCase() }}</div>
                  <div class="author-info">
                    <div class="review-name">{{ review.user_name }}</div>
                    <div class="review-plan">{{ review.plan }} Plan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Carousel Controls (Only show if multiple reviews) -->
          <div v-if="reviews.length > 1" class="carousel-controls">
            <button @click="previousReview" class="carousel-btn prev">‹</button>
            <div class="carousel-dots">
              <button v-for="(review, index) in reviews"
                      :key="`dot-${review.id}`"
                      @click="currentReviewIndex = index; console.log('🔘 Selected review index:', index)"
                      class="dot"
                      :class="{ active: index === currentReviewIndex }"
                      :title="`Review ${index + 1} of ${reviews.length}`"></button>
            </div>
            <button @click="nextReview" class="carousel-btn next">›</button>
          </div>
          
          <!-- Single Review Info -->
          <div v-else class="single-review-info">
            <p>{{ reviews.length }} review posted so far. More reviews coming soon!</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-icon">💬</div>
          <p>Be the first to share your experience with us!</p>
        </div>

        <!-- Leave Review Button (Only for logged-in customers) -->
        <div v-if="currentUser && currentUser.role === 'customer'" class="review-action">
          <button @click="goToReviewForm" class="btn-leave-review">
            ⭐ Leave Your Review
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '../api'

const router = useRouter()
const reviews = ref([])
const currentReviewIndex = ref(0)
const userState = ref(JSON.parse(localStorage.getItem('driveSureUser') || 'null'))

// Make currentUser reactive to localStorage changes
const currentUser = computed(() => userState.value)

// Fetch approved reviews
const fetchReviews = async () => {
  try {
    const response = await apiClient.get('/reviews')
    console.log('📊 Reviews API Response:', response)
    console.log('📊 Response type:', typeof response)
    console.log('📊 Is Array?', Array.isArray(response))
    reviews.value = Array.isArray(response) ? response : response.reviews || []
    console.log('✅ Reviews set to:', reviews.value)
    console.log('📊 Reviews length:', reviews.value.length)
    console.log('📊 Review IDs:', reviews.value.map(r => r.id).join(', '))
    console.log('📊 Review texts:', reviews.value.map(r => r.text).join(' | '))
    console.log('📊 Current index:', currentReviewIndex.value)
  } catch (err) {
    console.error('❌ Error loading reviews:', err)
  }
}

// Carousel navigation
const nextReview = () => {
  if (reviews.value.length <= 1) return
  currentReviewIndex.value = (currentReviewIndex.value + 1) % reviews.value.length
  console.log('➡️ Next review - now at index:', currentReviewIndex.value, 'of', reviews.value.length)
}

const previousReview = () => {
  if (reviews.value.length <= 1) return
  currentReviewIndex.value = (currentReviewIndex.value - 1 + reviews.value.length) % reviews.value.length
  console.log('⬅️ Previous review - now at index:', currentReviewIndex.value, 'of', reviews.value.length)
}

// Auto-rotate carousel and watch for new reviews
onMounted(() => {
  fetchReviews()
  
  // Auto-rotate every 5 seconds
  const autoRotateInterval = setInterval(() => {
    if (reviews.value.length > 1) {
      nextReview()
    }
  }, 5000)

  // Refresh reviews every 3 seconds to catch newly posted ones
  const refreshInterval = setInterval(() => {
    fetchReviews()
  }, 3000)

  // Check for localStorage changes every 1 second to detect login/logout
  const checkUserChangeInterval = setInterval(() => {
    const currentUserData = JSON.parse(localStorage.getItem('driveSureUser') || 'null')
    userState.value = currentUserData
  }, 1000)
  
  return () => {
    clearInterval(autoRotateInterval)
    clearInterval(refreshInterval)
    clearInterval(checkUserChangeInterval)
  }
})

// Navigate to review form
const goToReviewForm = () => {
  router.push('/customer/review')
}
</script>

<style scoped>
.reviews-bg {
  background: linear-gradient(135deg, #1a1f35 0%, #16213e 100%);
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
}

.reviews-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-tag {
  display: inline-block;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.section-title {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.section-subtitle {
  color: #cbd5e1;
  font-size: 1.05rem;
  margin: 0;
}

.carousel-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;
}

.reviews-carousel {
  position: relative;
  height: 350px;
}

.review-card {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  opacity: 0;
  transform: translateX(50px);
  transition: all 0.5s ease;
  pointer-events: none;
}

.review-card.active {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.review-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.stars {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.star {
  font-size: 1.25rem;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.review-text {
  color: #cbd5e1;
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 1rem 0;
  font-style: italic;
  flex-grow: 1;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.review-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.1rem;
}

.author-info {
  flex: 1;
}

.review-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0;
}

.review-plan {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0;
}

.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.single-review-info {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  color: #cbd5e1;
  font-size: 0.95rem;
  font-style: italic;
}

.carousel-btn {
  background: rgba(96, 165, 250, 0.2);
  border: 2px solid rgba(96, 165, 250, 0.3);
  color: #60a5fa;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-btn:hover {
  background: rgba(96, 165, 250, 0.3);
  border-color: rgba(96, 165, 250, 0.5);
  transform: scale(1.1);
}

.carousel-dots {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  background: #60a5fa;
  border-color: #60a5fa;
  transform: scale(1.3);
}

.dot:hover {
  background: rgba(96, 165, 250, 0.4);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.review-action {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.btn-leave-review {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1a1a1a;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.btn-leave-review:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
}

@media (max-width: 768px) {
  .reviews-bg {
    padding: 2rem 0;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
  }

  .review-card {
    height: auto;
    min-height: 300px;
    padding: 1.5rem;
  }

  .review-text {
    font-size: 1rem;
  }

  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .carousel-controls {
    gap: 1rem;
  }

  .btn-leave-review {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
