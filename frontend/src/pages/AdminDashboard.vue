<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p class="header-subtitle">System overview and management</p>
      </div>
      <div class="header-stats">
        <div class="total-stat">
          <span class="total-label">Total Users</span>
          <span class="total-number">{{ allUsers.length }}</span>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Container -->
      <div class="stats-container">
        <div class="stat-card requests">
          <div class="stat-header">
            <div class="stat-icon">◆</div>
            <div class="stat-title">Requests</div>
          </div>
          <div class="stat-main-number">{{ allRequests.length }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill requests" :style="{ width: allRequests.length > 0 ? '100%' : '0%' }"></div>
          </div>
          <div class="stat-footer">Total requests in system</div>
        </div>

        <div class="stat-card users">
          <div class="stat-header">
            <div class="stat-icon">○</div>
            <div class="stat-title">Users</div>
          </div>
          <div class="stat-main-number">{{ allUsers.length }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill users" :style="{ width: allUsers.length > 0 ? '100%' : '0%' }"></div>
          </div>
          <div class="stat-footer">Total registered users</div>
        </div>

        <div class="stat-card reviews">
          <div class="stat-header">
            <div class="stat-icon">★</div>
            <div class="stat-title">Reviews</div>
          </div>
          <div class="stat-main-number">{{ allReviews.length }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill reviews" :style="{ width: allReviews.length > 0 ? '100%' : '0%' }"></div>
          </div>
          <div class="stat-footer">Total customer reviews</div>
        </div>
      </div>

      <!-- Requests Section -->
      <div class="requests-section">
        <h2>All Requests</h2>
        <p class="section-subtitle">{{ allRequests.length }} total request(s)</p>

        <div v-if="loadingRequests" class="loading">Loading requests...</div>
        
        <div v-else-if="allRequests.length === 0" class="empty-state">
          <div class="empty-state-icon">─</div>
          <h3>No Requests</h3>
          <p>No customer requests yet</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="request in allRequests" :key="request.id" class="request-card">
            <div class="request-header">
              <div class="customer-info">
                <h3>{{ request.first_name }} {{ request.last_name }}</h3>
                <p class="email">{{ request.email }}</p>
              </div>
              <span class="status-badge" :class="request.status">{{ request.status }}</span>
            </div>

            <div class="request-details">
              <div class="detail">
                <label>Vehicle:</label>
                <span>{{ request.make }} - {{ request.car_type }}</span>
              </div>
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
              <div class="detail">
                <label>Date:</label>
                <span>{{ formatDate(request.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Section -->
      <div class="requests-section">
        <h2>👥 All Users</h2>
        <p class="section-subtitle">{{ allUsers.length }} total user(s)</p>

        <div v-if="loadingUsers" class="loading">Loading users...</div>
        
        <div v-else-if="allUsers.length === 0" class="empty-state">
          <div class="empty-state-icon">👤</div>
          <h3>No Users</h3>
          <p>No registered users yet</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="user in allUsers" :key="user.id" class="request-card">
            <div class="request-header">
              <div class="customer-info">
                <h3>{{ user.first_name }} {{ user.last_name }}</h3>
                <p class="email">{{ user.email }}</p>
              </div>
              <span class="role-badge" :class="user.role">{{ user.role }}</span>
            </div>

            <div class="request-details">
              <div class="detail">
                <label>Phone:</label>
                <span>{{ user.phone || 'N/A' }}</span>
              </div>
              <div class="detail">
                <label>Role:</label>
                <span class="plan-badge">{{ user.role }}</span>
              </div>
              <div class="detail">
                <label>Joined:</label>
                <span>{{ formatDate(user.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="requests-section">
        <h2>Customer Reviews</h2>
        <p class="section-subtitle">{{ allReviews.length }} total review(s)</p>

        <div v-if="loadingReviews" class="loading">Loading reviews...</div>
        
        <div v-else-if="allReviews.length === 0" class="empty-state">
          <div class="empty-state-icon">★</div>
          <h3>No Reviews</h3>
          <p>No customer reviews yet</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="review in allReviews" :key="review.id" class="request-card">
            <div class="request-header">
              <div class="customer-info">
                <h3>{{ review.user_name }}</h3>
                <p class="email">Plan: {{ review.plan }}</p>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div class="stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.stars }">★</span>
                </div>
                <button 
                  @click="deleteReview(review.id)" 
                  class="delete-btn"
                  title="Delete review"
                >
                  ✕
                </button>
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

      <!-- Contact Messages Section -->
      <div class="requests-section">
        <h2>Contact Messages</h2>
        <p class="section-subtitle">{{ allContactMessages.length }} total message(s)</p>

        <div v-if="loadingMessages" class="loading">Loading messages...</div>
        
        <div v-else-if="allContactMessages.length === 0" class="empty-state">
          <div class="empty-state-icon">✉</div>
          <h3>No Messages</h3>
          <p>No contact messages yet</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="msg in allContactMessages" :key="msg.id" class="request-card contact-card">
            <div class="request-header">
              <div class="customer-info">
                <h3>{{ msg.name }}</h3>
                <p class="email">{{ msg.email }}</p>
              </div>
              <button 
                @click="deleteMessage(msg.id)" 
                class="delete-btn"
                title="Delete message"
              >
                ✕
              </button>
            </div>

            <div class="contact-subject">
              <strong>Subject:</strong> {{ msg.subject }}
            </div>

            <div class="contact-message">
              {{ msg.message }}
            </div>

            <div class="review-footer">
              <span class="review-date">{{ formatDate(msg.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '../api'

const allRequests = ref([])
const allUsers = ref([])
const allReviews = ref([])
const allContactMessages = ref([])
const loadingRequests = ref(false)
const loadingUsers = ref(false)
const loadingReviews = ref(false)
const loadingMessages = ref(false)

// Fetch all requests
const fetchAllRequests = async () => {
  try {
    loadingRequests.value = true
    const response = await apiClient.get('/requests/all')
    allRequests.value = response.requests || []
  } catch (error) {
    console.error('Error fetching requests:', error)
  } finally {
    loadingRequests.value = false
  }
}

// Fetch all users
const fetchAllUsers = async () => {
  try {
    loadingUsers.value = true
    const response = await apiClient.get('/users')
    allUsers.value = Array.isArray(response) ? response : response.users || []
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loadingUsers.value = false
  }
}

// Fetch all reviews
const fetchAllReviews = async () => {
  try {
    loadingReviews.value = true
    const response = await apiClient.get('/reviews/admin/all')
    allReviews.value = Array.isArray(response) ? response : response.reviews || []
  } catch (error) {
    console.error('Error fetching reviews:', error)
  } finally {
    loadingReviews.value = false
  }
}

// Delete review
const deleteReview = async (reviewId) => {
  if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    try {
      console.log('🗑️ Deleting review:', reviewId)
      await apiClient.delete(`/reviews/${reviewId}`)
      console.log('✅ Review deleted successfully')
      // Refresh reviews list
      await fetchAllReviews()
    } catch (error) {
      console.error('❌ Error deleting review:', error)
      alert('Failed to delete review. Please try again.')
    }
  }
}

// Fetch all contact messages
const fetchAllMessages = async () => {
  try {
    loadingMessages.value = true
    const response = await apiClient.get('/contact')
    allContactMessages.value = Array.isArray(response) ? response : response.messages || []
  } catch (error) {
    console.error('Error fetching contact messages:', error)
  } finally {
    loadingMessages.value = false
  }
}

// Delete contact message
const deleteMessage = async (messageId) => {
  if (confirm('Are you sure you want to delete this message?')) {
    try {
      console.log('🗑️ Deleting message:', messageId)
      await apiClient.delete(`/contact/${messageId}`)
      console.log('✅ Message deleted successfully')
      // Refresh messages list
      await fetchAllMessages()
    } catch (error) {
      console.error('❌ Error deleting message:', error)
      alert('Failed to delete message. Please try again.')
    }
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

// Fetch all data on component mount
onMounted(() => {
  fetchAllRequests()
  fetchAllUsers()
  fetchAllReviews()
  fetchAllMessages()
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

.stat-card.users {
  border-top: 3px solid #10b981;
}

.stat-card.reviews {
  border-top: 3px solid #f59e0b;
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

.stat-bar-fill.users {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.stat-bar-fill.reviews {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
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

.customer-info h3 {
  color: #ffffff;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 600;
}

.customer-info .email {
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

.role-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(96, 165, 250, 0.3);
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
  line-height: 1.5;
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

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
  transform: scale(1.05);
}

.delete-btn:active {
  transform: scale(0.95);
}

.contact-card {
  display: flex;
  flex-direction: column;
}

.contact-subject {
  color: #e2e8f0;
  font-size: 0.95rem;
  margin: 1rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-message {
  color: #cbd5e1;
  font-size: 0.9rem;
  line-height: 1.6;
  flex: 1;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
    padding-top: 80px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.8rem;
  }

  .header-stats {
    width: 100%;
  }

  .requests-grid {
    grid-template-columns: 1fr;
  }

  .request-header {
    flex-direction: column;
  }
}
</style>
