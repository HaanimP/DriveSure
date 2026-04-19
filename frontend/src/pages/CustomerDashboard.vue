<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>My Dashboard</h1>
        <p class="header-subtitle">Your requests and reviews</p>
      </div>
      <div class="header-stats">
        <div class="total-stat">
          <span class="total-label">Active Requests</span>
          <span class="total-number">{{ activeRequestsCount }}</span>
        </div>
      </div>
    </div>

    <!-- Request Updates Info Box -->
    <div class="agent-updates-info">
      <div class="info-box-icon">📨</div>
      <div class="info-box-content">
        <h3>Request Updates</h3>
        <p>Your assigned agent will message you directly with updates about your request and any vehicles found matching your criteria.</p>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Container -->
      <div class="stats-container">
        <div class="stat-card requests">
          <div class="stat-header">
            <div class="stat-icon">📋</div>
            <div class="stat-title">My Requests</div>
          </div>
          <div class="stat-main-number">{{ userRequests.length }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill requests" :style="{ width: userRequests.length > 0 ? '100%' : '0%' }"></div>
          </div>
          <div class="stat-footer">Total car search requests</div>
        </div>

        <div class="stat-card reviews">
          <div class="stat-header">
            <div class="stat-icon">⭐</div>
            <div class="stat-title">My Reviews</div>
          </div>
          <div class="stat-main-number">{{ userReviews.length }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill reviews" :style="{ width: userReviews.length > 0 ? '100%' : '0%' }"></div>
          </div>
          <div class="stat-footer">Reviews you've submitted</div>
        </div>

        <div class="stat-card status">
          <div class="stat-header">
            <div class="stat-icon">✓</div>
            <div class="stat-title">Completed</div>
          </div>
          <div class="stat-main-number">{{ completedCount }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill status" :style="{ width: userRequests.length > 0 ? ((completedCount / userRequests.length) * 100) + '%' : '0%' }"></div>
          </div>
          <div class="stat-footer">Completed requests</div>
        </div>
      </div>

      <!-- My Requests Section -->
      <div class="requests-section">
        <h2>📋 My Requests</h2>
        <p class="section-subtitle">{{ userRequests.length }} total request(s)</p>

        <div v-if="loadingRequests" class="loading">Loading your requests...</div>
        
        <div v-else-if="userRequests.length === 0" class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>No Requests Yet</h3>
          <p>Visit the Car Request page to submit your first request</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="request in userRequests" :key="request.id" class="request-card">
            <div class="request-header">
              <div class="vehicle-info">
                <h3>{{ request.make }} {{ request.car_type }}</h3>
                <p class="year">{{ request.year_range }}</p>
              </div>
              <span class="status-badge" :class="request.status">{{ request.status }}</span>
            </div>

            <div class="request-details">
              <div class="detail">
                <label>Budget:</label>
                <span>R {{ request.budget_min?.toLocaleString() }} - R {{ request.budget_max?.toLocaleString() }}</span>
              </div>
              <div class="detail">
                <label>Location:</label>
                <span>{{ request.area }}</span>
              </div>
              <div class="detail">
                <label>Plan:</label>
                <span class="plan-badge">{{ request.plan }}</span>
              </div>
              <div v-if="request.notes" class="detail">
                <label>Notes:</label>
                <span class="notes">{{ request.notes }}</span>
              </div>
              <div class="detail">
                <label>Submitted:</label>
                <span>{{ formatDate(request.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Reviews Section -->
      <div class="requests-section">
        <h2>⭐ My Reviews</h2>
        <p class="section-subtitle">{{ userReviews.length }} total review(s)</p>

        <div v-if="loadingReviews" class="loading">Loading your reviews...</div>
        
        <div v-else-if="userReviews.length === 0" class="empty-state">
          <div class="empty-state-icon">⭐</div>
          <h3>No Reviews Yet</h3>
          <p>Share your experience by leaving a review</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="review in userReviews" :key="review.id" class="review-card">
            <div class="review-header">
              <div class="review-info">
                <h3>Your Review</h3>
                <p class="plan">Plan: {{ review.plan }}</p>
              </div>
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.stars }">⭐</span>
              </div>
            </div>

            <div class="review-text">
              {{ review.text }}
            </div>

            <div class="review-footer">
              <span class="review-date">{{ formatDate(review.created_at) }}</span>
              <span class="posted-badge">✓ Posted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../api'

const userRequests = ref([])
const userReviews = ref([])
const loadingRequests = ref(false)
const loadingReviews = ref(false)
const userId = ref(null)

// Computed properties
const activeRequestsCount = computed(() => {
  return userRequests.value.filter(r => r.status === 'pending' || r.status === 'in-progress').length
})

const completedCount = computed(() => {
  return userRequests.value.filter(r => r.status === 'completed').length
})

// Fetch user's requests
const fetchUserRequests = async () => {
  try {
    loadingRequests.value = true
    const userData = JSON.parse(localStorage.getItem('driveSureUser') || '{}')
    if (!userData.id) {
      console.log('No user ID found')
      return
    }
    userId.value = userData.id
    const response = await apiClient.get(`/requests/user/${userData.id}`)
    userRequests.value = response.requests || []
  } catch (error) {
    console.error('Error fetching user requests:', error)
  } finally {
    loadingRequests.value = false
  }
}

// Fetch user's reviews
const fetchUserReviews = async () => {
  try {
    loadingReviews.value = true
    const userData = JSON.parse(localStorage.getItem('driveSureUser') || '{}')
    if (!userData.id) {
      console.log('⚠️ No user ID found')
      return
    }
    
    console.log('📊 Fetching reviews for user:', userData.id)
    
    // Fetch user's specific reviews from new endpoint
    const response = await apiClient.get(`/reviews/user/${userData.id}`)
    console.log('📊 API Response:', response)
    
    const allReviews = Array.isArray(response) ? response : response.reviews || []
    console.log('✅ User reviews received:', allReviews)
    
    userReviews.value = allReviews
  } catch (error) {
    console.error('❌ Error fetching user reviews:', error)
  } finally {
    loadingReviews.value = false
  }
}

// Format date helper
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch data on component mount
onMounted(() => {
  fetchUserRequests()
  fetchUserReviews()
  
  // Auto-refresh reviews every 3 seconds to catch newly posted ones
  const refreshInterval = setInterval(() => {
    fetchUserReviews()
  }, 3000)
  
  return () => {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem;
  padding-top: 100px;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.dashboard-header {
  max-width: 1400px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.dashboard-header h1 {
  color: #ffffff;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-subtitle {
  color: #cbd5e1;
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.total-stat {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.total-label {
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 500;
}

.total-number {
  color: #60a5fa;
  font-size: 1.8rem;
  font-weight: 700;
  margin-top: 0.5rem;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
}

.stat-card.requests {
  border-top: 3px solid #3b82f6;
}

.stat-card.reviews {
  border-top: 3px solid #f59e0b;
}

.stat-card.status {
  border-top: 3px solid #10b981;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-title {
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 600;
}

.stat-main-number {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.stat-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stat-bar-fill.requests {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.stat-bar-fill.reviews {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.stat-bar-fill.status {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.stat-footer {
  color: #94a3b8;
  font-size: 0.8rem;
}

.requests-section {
  margin-bottom: 2rem;
}

.requests-section h2 {
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.section-subtitle {
  color: #cbd5e1;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #cbd5e1;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: #cbd5e1;
}

.empty-state-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-state h3 {
  color: #ffffff;
  margin: 0.5rem 0;
}

.empty-state p {
  margin: 0;
}

.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.request-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.request-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.vehicle-info h3 {
  color: #ffffff;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.vehicle-info .year {
  color: #cbd5e1;
  font-size: 0.85rem;
  margin: 0.35rem 0 0 0;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-badge.in-progress {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.plan-badge {
  display: inline-block;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail {
  display: flex;
  flex-direction: column;
}

.detail label {
  font-weight: 600;
  color: #cbd5e1;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail span {
  color: #ffffff;
  font-size: 0.95rem;
}

.notes {
  font-style: italic;
  line-height: 1.4;
}

.review-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.review-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.review-info h3 {
  color: #ffffff;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.review-info .plan {
  color: #cbd5e1;
  font-size: 0.85rem;
  margin: 0.35rem 0 0 0;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  font-size: 1rem;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.star.filled {
  opacity: 1;
}

.review-text {
  color: #cbd5e1;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 1rem 0;
  font-style: italic;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.85rem;
}

.review-date {
  color: #94a3b8;
}

.posted-badge {
  color: #34d399;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .dashboard {
    padding: 1.5rem;
    padding-top: 90px;
  }

  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }

  .stat-main-number {
    font-size: 2rem;
  }

  .requests-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
    padding-top: 75px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .dashboard-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .header-stats {
    width: 100%;
    gap: 1rem;
  }

  .total-stat {
    flex: 1;
    padding: 0.9rem 1.2rem;
  }

  .total-label {
    font-size: 0.8rem;
  }

  .total-number {
    font-size: 1.5rem;
    margin-top: 0.3rem;
  }

  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1.25rem;
    border-radius: 12px;
  }

  .stat-main-number {
    font-size: 1.8rem;
  }

  .stat-foot { font-size: 0.75rem; }

  .requests-section h2 {
    font-size: 1.3rem;
    margin-bottom: 0.35rem;
  }

  .requests-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .request-card {
    padding: 1.25rem;
    border-radius: 10px;
  }

  .request-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .vehicle-info h3 {
    font-size: 1rem;
  }

  .status-badge {
    padding: 0.35rem 0.7rem;
    font-size: 0.65rem;
  }

  .request-details {
    gap: 0.65rem;
  }

  .detail label {
    font-size: 0.7rem;
    margin-bottom: 0.2rem;
  }

  .detail span {
    font-size: 0.9rem;
  }

  .review-card {
    padding: 1.25rem;
  }
}

@media (max-width: 600px) {
  .dashboard {
    padding: 0.75rem;
    padding-top: 65px;
  }

  .dashboard-header {
    margin-bottom: 1.25rem;
    gap: 0;
  }

  .dashboard-header h1 {
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
  }

  .header-subtitle {
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .header-stats {
    width: 100%;
    gap: 0.75rem;
  }

  .total-stat {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 10px;
  }

  .total-label {
    font-size: 0.7rem;
  }

  .total-number {
    font-size: 1.3rem;
    margin-top: 0.3rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .stat-card {
    padding: 1rem;
    border-radius: 10px;
  }

  .stat-header {
    gap: 0.5rem;
    margin-bottom: 0.8rem;
  }

  .stat-icon {
    font-size: 1.3rem;
  }

  .stat-title {
    font-size: 0.8rem;
  }

  .stat-main-number {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .stat-bar {
    height: 5px;
    margin-bottom: 0.6rem;
  }

  .stat-footer {
    font-size: 0.75rem;
  }

  .section-subtitle {
    margin-bottom: 1rem;
    font-size: 0.85rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-state-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }

  .empty-state h3 {
    font-size: 1rem;
    margin: 0.35rem 0;
  }

  .empty-state p {
    font-size: 0.85rem;
  }

  .requests-grid {
    gap: 0.75rem;
  }

  .request-card {
    padding: 1rem;
    border-radius: 10px;
  }

  .request-header {
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.8rem;
  }

  .vehicle-info h3 {
    font-size: 0.95rem;
    margin-bottom: 0.2rem;
  }

  .vehicle-info .year {
    font-size: 0.8rem;
    margin-top: 0.2rem;
  }

  .status-badge {
    padding: 0.3rem 0.6rem;
    font-size: 0.6rem;
  }

  .plan-badge {
    padding: 0.25rem 0.6rem;
    font-size: 0.75rem;
  }

  .request-details {
    gap: 0.6rem;
  }

  .detail {
    gap: 0.2rem;
  }

  .detail label {
    font-size: 0.65rem;
    margin-bottom: 0.15rem;
  }

  .detail span {
    font-size: 0.85rem;
  }

  .review-card {
    padding: 1rem;
    border-radius: 10px;
  }

  .review-header {
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding-bottom: 0.8rem;
  }

  .review-info h3 {
    font-size: 0.95rem;
  }

  .review-info .plan {
    font-size: 0.8rem;
  }

  .review-text {
    font-size: 0.85rem;
    margin: 0.8rem 0;
    line-height: 1.5;
  }

  .review-footer {
    font-size: 0.8rem;
    gap: 0.5rem;
  }
}

@media (max-width: 400px) {
  .dashboard {
    padding: 0.5rem;
    padding-top: 60px;
  }

  .dashboard-header h1 {
    font-size: 1.2rem;
  }

  .header-subtitle {
    font-size: 0.75rem;
  }

  .header-stats {
    gap: 0.5rem;
  }

  .total-stat {
    padding: 0.6rem 0.8rem;
  }

  .total-label {
    font-size: 0.65rem;
  }

  .total-number {
    font-size: 1.1rem;
    margin-top: 0.2rem;
  }

  .stats-container {
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.85rem;
  }

  .stat-main-number {
    font-size: 1.3rem;
  }

  .request-card, .review-card {
    padding: 0.9rem;
  }

  .vehicle-info h3, .review-info h3 {
    font-size: 0.9rem;
  }
}
</style>
