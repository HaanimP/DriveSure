<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1>Agent Dashboard</h1>
        <p class="header-subtitle">Manage customer requests and track your progress</p>
      </div>
      <div class="header-stats">
        <div class="total-stat">
          <span class="total-label">Total Requests</span>
          <span class="total-number">{{ requests.length }}</span>
        </div>
      </div>
    </div>

    <!-- New Requests Info Box -->
    <div class="agent-updates-info">
      <div class="info-box-icon">📨</div>
      <div class="info-box-content">
        <h3>New Requests</h3>
        <p>You'll receive new car requests in your dashboard. Check your requests regularly to stay updated on customer needs.</p>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Cards Row with Charts -->
      <div class="stats-container">
        <div class="stat-card pending">
          <div class="stat-header">
            <div class="stat-icon">⏳</div>
            <div class="stat-title">Pending</div>
          </div>
          <div class="stat-main-number">{{ statsCount.pending }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill pending" :style="{ width: getTotalRequests() > 0 ? (statsCount.pending / getTotalRequests() * 100) + '%' : '0%' }"></div>
          </div>
          <div class="stat-footer">{{ getPercentage(statsCount.pending) }}% of total</div>
        </div>

        <div class="stat-card in-progress">
          <div class="stat-header">
            <div class="stat-icon">🔄</div>
            <div class="stat-title">In Progress</div>
          </div>
          <div class="stat-main-number">{{ statsCount.inProgress }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill in-progress" :style="{ width: getTotalRequests() > 0 ? (statsCount.inProgress / getTotalRequests() * 100) + '%' : '0%' }"></div>
          </div>
          <div class="stat-footer">{{ getPercentage(statsCount.inProgress) }}% of total</div>
        </div>

        <div class="stat-card completed">
          <div class="stat-header">
            <div class="stat-icon">✅</div>
            <div class="stat-title">Completed</div>
          </div>
          <div class="stat-main-number">{{ statsCount.completed }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill completed" :style="{ width: getTotalRequests() > 0 ? (statsCount.completed / getTotalRequests() * 100) + '%' : '0%' }"></div>
          </div>
          <div class="stat-footer">{{ getPercentage(statsCount.completed) }}% of total</div>
        </div>

        <div class="stat-card cancelled">
          <div class="stat-header">
            <div class="stat-icon">❌</div>
            <div class="stat-title">Cancelled</div>
          </div>
          <div class="stat-main-number">{{ statsCount.cancelled }}</div>
          <div class="stat-bar">
            <div class="stat-bar-fill cancelled" :style="{ width: getTotalRequests() > 0 ? (statsCount.cancelled / getTotalRequests() * 100) + '%' : '0%' }"></div>
          </div>
          <div class="stat-footer">{{ getPercentage(statsCount.cancelled) }}% of total</div>
        </div>
      </div>

      <!-- Active Requests Section -->
      <div class="requests-section">
        <h2>📋 Active Requests</h2>
        <p class="section-subtitle">{{ activeRequests.length }} active request(s)</p>

        <div v-if="loading" class="loading">Loading requests...</div>
        
        <div v-else-if="activeRequests.length === 0" class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>No Active Requests</h3>
          <p>There are no pending or in-progress requests right now.</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="request in activeRequests" :key="request.id" class="request-card active">
            <div class="request-header">
              <div class="customer-info">
                <h3>{{ request.first_name }} {{ request.last_name }}</h3>
                <p class="email">{{ request.email }}</p>
              </div>
              <span class="status-badge" :class="request.status">{{ request.status }}</span>
            </div>

            <div class="request-details">
              <div class="detail">
                <label>Looking For:</label>
                <span>{{ request.make }} - {{ request.car_type }}</span>
              </div>
              <div class="detail">
                <label>Year Range:</label>
                <span>{{ request.year_range }}</span>
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
              <div v-if="request.notes" class="detail">
                <label>Notes:</label>
                <span class="notes">{{ request.notes }}</span>
              </div>
            </div>

            <div class="request-actions">
              <div class="status-selector">
                <select :value="request.status" @change="(e) => updateRequestStatusHandler(request, e.target.value)">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="contact-info">
                <p><strong>📞 {{ request.phone }}</strong></p>
              </div>
            </div>

            <div v-if="request.agent_notes" class="agent-notes">
              <strong>Agent Notes:</strong> {{ request.agent_notes }}
            </div>
          </div>
        </div>
      </div>

      <!-- Request History Section -->
      <div class="requests-section history-section">
        <h2>📜 Request History</h2>
        <p class="section-subtitle">{{ historyRequests.length }} completed/cancelled request(s)</p>

        <div v-if="historyRequests.length === 0" class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No History Yet</h3>
          <p>Completed or cancelled requests will appear here</p>
        </div>

        <div v-else class="requests-grid">
          <div v-for="request in historyRequests" :key="request.id" class="request-card history">
            <div class="request-header">
              <div class="customer-info">
                <h3>{{ request.first_name }} {{ request.last_name }}</h3>
                <p class="email">{{ request.email }}</p>
              </div>
              <span class="status-badge" :class="request.status">{{ request.status }}</span>
            </div>

            <div class="request-details">
              <div class="detail">
                <label>Looking For:</label>
                <span>{{ request.make }} - {{ request.car_type }}</span>
              </div>
              <div class="detail">
                <label>Year Range:</label>
                <span>{{ request.year_range }}</span>
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
              <div v-if="request.notes" class="detail">
                <label>Notes:</label>
                <span class="notes">{{ request.notes }}</span>
              </div>
            </div>

            <div v-if="request.agent_notes" class="agent-notes">
              <strong>Agent Notes:</strong> {{ request.agent_notes }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../api'

export default {
  setup() {
    const requests = ref([])
    const loading = ref(false)

    onMounted(async () => {
      await fetchRequests()
    })

    const fetchRequests = async () => {
      try {
        loading.value = true
        const result = await apiClient.get('/requests/all')
        requests.value = result.requests || []
      } catch (err) {
        console.error('Error loading requests:', err)
      } finally {
        loading.value = false
      }
    }

    const activeRequests = computed(() => {
      return requests.value.filter(r => r.status === 'pending' || r.status === 'in-progress')
    })

    const historyRequests = computed(() => {
      return requests.value.filter(r => r.status === 'completed' || r.status === 'cancelled').sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    })

    const statsCount = computed(() => ({
      pending: requests.value.filter(r => r.status === 'pending').length,
      inProgress: requests.value.filter(r => r.status === 'in-progress').length,
      completed: requests.value.filter(r => r.status === 'completed').length,
      cancelled: requests.value.filter(r => r.status === 'cancelled').length
    }))

    const updateRequestStatus = async (request) => {
      try {
        console.log('Updating request', request.id, 'to status:', request.status)
        await apiClient.put(`/requests/${request.id}`, {
          status: request.status
        })
        console.log('Status updated successfully')
        await fetchRequests()
      } catch (err) {
        console.error('Error updating request:', err)
        await fetchRequests()
      }
    }

    const updateRequestStatusHandler = async (request, newStatus) => {
      // Show optimistic update by fetching fresh data immediately
      const oldStatus = request.status
      request.status = newStatus
      
      try {
        await apiClient.put(`/requests/${request.id}`, {
          status: newStatus
        })
        console.log('Status updated successfully to:', newStatus)
        // Refetch to ensure data is in sync with server
        await fetchRequests()
      } catch (err) {
        console.error('Error updating request:', err)
        // Revert on error
        request.status = oldStatus
        await fetchRequests()
      }
    }

    const getTotalRequests = () => {
      return requests.value.length
    }

    const getPercentage = (count) => {
      if (getTotalRequests() === 0) return 0
      return Math.round((count / getTotalRequests()) * 100)
    }

    return {
      requests,
      activeRequests,
      historyRequests,
      statsCount,
      loading,
      updateRequestStatus,
      updateRequestStatusHandler,
      getTotalRequests,
      getPercentage
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 2rem;
  padding-top: 100px;
}

.dashboard-header {
  max-width: 1400px;
  margin: 0 auto 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.dashboard-header h1 {
  color: #ffffff;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.header-subtitle {
  color: #cbd5e1;
  margin: 0.5rem 0 0;
  font-size: 1rem;
  font-weight: 400;
}

.header-stats {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  border-radius: 12px;
  display: flex;
  gap: 2rem;
}

.total-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.total-label {
  color: #cbd5e1;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.total-number {
  color: #60a5fa;
  font-size: 2.5rem;
  font-weight: 800;
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: transparent;
}

.stat-card.pending::before {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-card.in-progress::before {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-card.completed::before {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.stat-card.cancelled::before {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

.stat-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-title {
  color: #cbd5e1;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-main-number {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1.5rem;
  line-height: 1;
}

.stat-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.stat-bar-fill {
  height: 100%;
  transition: width 0.6s ease-out;
  border-radius: 10px;
}

.stat-bar-fill.pending {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-bar-fill.in-progress {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-bar-fill.completed {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.stat-bar-fill.cancelled {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

.stat-footer {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Requests Section */
.requests-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 2.5rem;
}

.requests-section h2 {
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.section-subtitle {
  color: #cbd5e1;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #cbd5e1;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #cbd5e1;
}

.empty-state-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.requests-grid {
  display: grid;
  gap: 1.5rem;
}

.request-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.request-card.active {
  border-left: 4px solid #60a5fa;
  border-left-width: 4px;
}

.request-card.history {
  border-left: 4px solid #10b981;
  opacity: 0.85;
}

.request-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.customer-info h3 {
  margin: 0 0 0.5rem;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
}

.email {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 24px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: #78350f;
}

.status-badge.in-progress {
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  color: #0c1e3e;
}

.status-badge.completed {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: #064e3b;
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  color: #7f1d1d;
}

.request-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail {
  display: flex;
  flex-direction: column;
}

.detail label {
  font-weight: 700;
  color: #94a3b8;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail span {
  color: #e2e8f0;
  word-break: break-word;
  font-size: 0.95rem;
  font-weight: 500;
}

.notes {
  font-style: italic;
  white-space: pre-wrap;
}

.plan-badge {
  display: inline-block;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.request-actions {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  align-items: center;
  flex-wrap: wrap;
}

.status-selector {
  flex: 1;
  min-width: 180px;
}

.status-selector select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.95rem;
  color: #ffffff;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  background: rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
  font-weight: 500;
}

.status-selector select:hover {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}

.status-selector select:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.15);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.status-selector select option {
  background: #1e293b;
  color: #ffffff;
}

.contact-info {
  text-align: right;
}

.contact-info p {
  margin: 0;
  color: #e2e8f0;
  font-weight: 600;
}

.agent-notes {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
  border-left: 4px solid #10b981;
  padding: 1rem 1.25rem;
  margin-top: 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #86efac;
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

@media (max-width: 1200px) {
  .dashboard {
    padding: 1.5rem;
  }

  .stats-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }

  .requests-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .header-stats {
    width: 100%;
    gap: 1rem;
  }

  .header-stats .stat-item {
    flex: 1;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1.25rem;
    border-radius: 10px;
  }

  .stat-main-number {
    font-size: 1.8rem;
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
    gap: 0.5rem;
  }

  .request-header h3 {
    font-size: 1rem;
  }

  .request-details {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .request-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-selector, .contact-info {
    width: 100%;
  }

  .contact-info {
    text-align: left;
  }

  .request-actions button {
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 600px) {
  .dashboard {
    padding: 0.75rem;
    padding-top: 65px;
  }

  .dashboard-header {
    gap: 0.5rem;
  }

  .dashboard-header h1 {
    font-size: 1.3rem;
  }

  .header-stats {
    gap: 0.5rem;
  }

  .header-stats .stat-item {
    padding: 0.75rem 0.9rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-main-number {
    font-size: 1.5rem;
  }

  .requests-grid {
    gap: 0.75rem;
  }

  .request-card {
    padding: 1rem;
  }

  .request-header {
    gap: 0.35rem;
  }

  .request-header h3 {
    font-size: 0.95rem;
  }

  .request-details {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .request-detail-item label {
    font-size: 0.75rem;
  }

  .request-detail-item span {
    font-size: 0.9rem;
  }

  .request-actions {
    gap: 0.4rem;
  }

  .request-actions button {
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
  }

  .status-selector, .contact-info {
    padding: 0.65rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  .dashboard {
    padding: 0.5rem;
    padding-top: 60px;
  }

  .dashboard-header h1 {
    font-size: 1.1rem;
  }

  .header-stats {
    gap: 0.35rem;
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

  .request-card {
    padding: 0.9rem;
  }

  .request-header h3 {
    font-size: 0.85rem;
  }

  .request-actions button {
    padding: 0.55rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
