<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="background-gradient"></div>
      <div class="profile-content">
        <div class="profile-picture-container">
          <img :src="profilePicture || getInitials(user.first_name, user.last_name)" :alt="user.first_name" class="profile-picture">
          <label class="picture-upload" @click="triggerFileInput">
            <span class="upload-icon">📷</span>
            <input type="file" ref="fileInput" @change="onPictureChange" accept="image/*" style="display:none">
          </label>
        </div>
        <div class="profile-info">
          <h1>{{ user.first_name }} {{ user.last_name }}</h1>
          <p class="role-badge">{{ user.role }} • Member since {{ getMemberSince() }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total_requests || 0 }}</div>
        <div class="stat-label">Total Requests</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.completed_requests || 0 }}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ (stats.average_rating || 0).toFixed(1) }}</div>
        <div class="stat-label">Avg Rating</div>
      </div>
    </div>

    <!-- Profile Tabs -->
    <div class="profile-tabs">
      <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="{ active: activeTab === tab }" class="tab-button">
        {{ tab }}
      </button>
    </div>

    <!-- Personal Info Tab (with Security) -->
    <div v-if="activeTab === 'Personal Info'" class="tab-content">
      <!-- Personal Information Section -->
      <div class="info-section">
        <h2>👤 Personal Information</h2>
        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-grid">
            <div class="form-group">
              <label>First Name</label>
              <input v-model="editData.first_name" type="text" required>
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input v-model="editData.last_name" type="text" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input :value="user.email" type="email" disabled>
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="editData.phone" type="tel" placeholder="e.g., +27 123 456 7890">
            </div>
          </div>
          <button type="submit" class="btn-primary">Save Changes</button>
        </form>
      </div>

      <!-- Security Information Section -->
      <div class="info-section security-section">
        <h2>🔐 Security</h2>
        <form @submit.prevent="changePassword" class="profile-form">
          <div class="form-group" style="max-width: 500px;">
            <label>Current Password</label>
            <input v-model="passwordData.currentPassword" type="password" required>
          </div>
          <div class="form-group" style="max-width: 500px;">
            <label>New Password</label>
            <input v-model="passwordData.newPassword" type="password" required>
          </div>
          <div class="form-group" style="max-width: 500px;">
            <label>Confirm Password</label>
            <input v-model="passwordData.confirmPassword" type="password" required>
          </div>
          <button type="submit" class="btn-primary">Change Password</button>
        </form>
      </div>

      <!-- Notification Settings Section -->
      <div class="info-section settings-section">
        <h2>🔔 Notifications & Account</h2>
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.newRequests">
            <span>Notify me when I get assigned a new request</span>
          </label>
        </div>
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.cancellations">
            <span>Notify me when a request is cancelled</span>
          </label>
        </div>
        <button @click="logout" class="btn-secondary logout-btn">Logout</button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const activeTab = ref('Personal Info');
const tabs = ['Personal Info'];

const user = ref({});
const editData = ref({});
const passwordData = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const requests = ref([]);
const reviews = ref([]);
const stats = ref({});
const settings = ref({ 
  newRequests: true,
  cancellations: true
});
const profilePicture = ref(null);
const fileInput = ref(null);
const message = ref(null);
const showNotification = ref(false);
const newRequests = ref([]);

const triggerFileInput = () => fileInput.value?.click();

const onPictureChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicture.value = e.target.result;
      editData.value.profile_picture = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const getInitials = (first, last) => {
  const initials = `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2ECC71';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 100, 100);
  return canvas.toDataURL();
};

const getMemberSince = () => {
  const date = new Date(user.value.created_at);
  return date.toLocaleDateString();
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

const saveProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:3001/api/profile/${user.value.id}`,
      editData.value,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    user.value = { ...user.value, ...editData.value };
    showMessage('Profile updated successfully!', 'success');
  } catch (error) {
    showMessage(error.response?.data?.error || 'Failed to update profile', 'error');
  }
};

const changePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.post(
      `http://localhost:3001/api/profile/${user.value.id}/change-password`,
      {
        currentPassword: passwordData.value.currentPassword,
        newPassword: passwordData.value.newPassword
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    showMessage('Password changed successfully!', 'success');
  } catch (error) {
    showMessage(error.response?.data?.error || 'Failed to change password', 'error');
  }
};

const fetchUserData = async () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('driveSureUser'));
    const token = localStorage.getItem('token');

    const response = await axios.get(
      `http://localhost:3001/api/profile/${storedUser.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    user.value = response.data;
    editData.value = { first_name: response.data.first_name, last_name: response.data.last_name, phone: response.data.phone };

    // Fetch stats
    const statsResponse = await axios.get(
      `http://localhost:3001/api/profile/${storedUser.id}/stats`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    stats.value = statsResponse.data;

    // Fetch requests
    const reqResponse = await axios.get(
      `http://localhost:3001/api/requests`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    requests.value = reqResponse.data.filter(r => r.agent_id === storedUser.id);

    // Fetch reviews
    const revResponse = await axios.get(
      `http://localhost:3001/api/reviews`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    reviews.value = revResponse.data.filter(r => r.about_agent_id === storedUser.id);

    // Check for agent notifications
    await checkForAgentNotifications(storedUser.id);
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    showMessage('Failed to load profile', 'error');
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('driveSureUser');
  router.push('/');
  showMessage('Logged out successfully', 'success');
};

const closeNotification = () => {
  showNotification.value = false;
};

const checkForAgentNotifications = async (userId) => {
  try {
    const lastCheck = localStorage.getItem('lastAgentNotificationCheck');
    const today = new Date().toDateString();
    
    if (lastCheck === today) {
      return;
    }

    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:3001/api/requests/all`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Check for new requests assigned to this agent or cancelled ones in the last 24 hours
    const updates = response.data.filter(req => {
      const createdDate = new Date(req.created_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return createdDate > dayAgo && (req.agent_id === userId || req.status === 'cancelled');
    });

    if (updates.length > 0 && (settings.value.newRequests || settings.value.cancellations)) {
      newRequests.value = updates;
      showNotification.value = true;
      localStorage.setItem('lastAgentNotificationCheck', today);
    }
  } catch (error) {
    console.error('Error checking for agent notifications:', error);
  }
};

const showMessage = (text, type) => {
  message.value = { text, type };
  setTimeout(() => (message.value = null), 3000);
};

onMounted(fetchUserData);
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f7f9fc 0%, #eef2f9 100%);
  padding-bottom: 60px;
  padding-top: 0;
}

body.dark-mode .profile-container {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
}

.profile-header {
  position: relative;
  background: linear-gradient(135deg, #1a3a6b 0%, #2d5a9f 100%);
  padding: 40px 20px;
  color: white;
  margin: 0 0 30px 0;
  margin-top: 64px;
  box-shadow: var(--shadow-med);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

body.dark-mode .profile-header {
  background: linear-gradient(135deg, #1a2a3a 0%, #2d3a5a 100%);
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(20, 70, 40, 0.8) 0%, rgba(46, 204, 113, 0.4) 100%);
  z-index: 0;
}

.profile-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 30px;
}

.profile-picture-container {
  position: relative;
  flex-shrink: 0;
}

.profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 5px solid white;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.picture-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 20px;
  transition: transform 0.3s;
}

.picture-upload:hover {
  transform: scale(1.1);
}

.profile-info h1 {
  font-size: 32px;
  margin: 0 0 10px;
  font-weight: 600;
}

.role-badge {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-transform: capitalize;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: -50px auto 40px;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #27AE60;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.profile-tabs {
  display: flex;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 0 20px;
  flex-wrap: wrap;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button:hover {
  color: var(--blue);
}

.tab-button.active {
  color: var(--blue);
  border-bottom-color: var(--blue);
}

.tab-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--gray-light);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}

.form-group input {
  padding: 12px 15px;
  border: 1px solid var(--gray-light);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-primary);
  color: var(--text);
  transition: all 0.3s;
  box-shadow: var(--shadow-light);
}

.form-group input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.1);
}

body.dark-mode .form-group input:focus {
  box-shadow: 0 0 0 3px rgba(107, 163, 255, 0.2);
}

.form-group input:disabled {
  background: var(--bg-secondary);
  color: var(--gray);
}

.requests-list,
.reviews-list {
  display: grid;
  gap: 20px;
}

.request-card,
.review-card {
  padding: 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #e0f5ea 100%);
  border-radius: 12px;
  border-left: 4px solid #27AE60;
  transition: transform 0.3s;
}

.request-card:hover,
.review-card:hover {
  transform: translateX(5px);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.request-header h3 {
  margin: 0;
  color: #27AE60;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #FFF3CD;
  color: #856404;
}

.status-badge.in-progress {
  background: #D1ECF1;
  color: #0C5460;
}

.status-badge.completed {
  background: #D4EDDA;
  color: #155724;
}

.request-detail {
  margin: 8px 0;
  color: #555;
  font-size: 14px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-customer {
  margin: 0 0 8px;
  color: #27AE60;
}

.star-rating {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 18px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.approval-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.approval-badge.approved {
  background: #D4EDDA;
  color: #155724;
}

.approval-badge.pending {
  background: #FFF3CD;
  color: #856404;
}

.review-text {
  color: #555;
  margin: 12px 0;
  line-height: 1.6;
}

.review-date {
  color: #999;
  font-size: 12px;
  margin: 0;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.empty-state a {
  color: #27AE60;
  text-decoration: none;
  font-weight: 600;
}

.settings-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section h3 {
  margin: 0 0 20px;
  color: #333;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  color: #555;
}

.setting-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.toggle-btn {
  padding: 8px 16px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  color: #666;
}

.toggle-btn.active {
  background: #0052CC;
  color: white;
  border-color: #0052CC;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.verified {
  background: #D4EDDA;
  color: #155724;
}

.danger-zone {
  border-top: 2px solid #FFE0E0;
  padding-top: 100px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--blue);
  color: white;
  align-self: flex-start;
  box-shadow: var(--shadow-light);
}

.btn-primary:hover {
  background: var(--blue-mid);
  transform: translateY(-2px);
  box-shadow: var(--shadow-med);
}

.btn-secondary {
  background: var(--red);
  color: white;
  align-self: flex-start;
  box-shadow: var(--shadow-light);
}

.btn-secondary:hover {
  background: #a93226;
  transform: translateY(-2px);
  box-shadow: var(--shadow-med);
}

.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 600;
  animation: slideUp 0.3s ease;
}

.message.success {
  background: #D4EDDA;
  color: #155724;
}

.message.error {
  background: #F8D7DA;
  color: #721C24;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding-top: 60px;
  }

  .profile-header {
    padding: 30px 15px;
  }

  .profile-content {
    flex-direction: column;
    text-align: center;
  }

  .profile-picture {
    width: 120px;
    height: 120px;
  }

  .profile-info h1 {
    font-size: 24px;
  }

  .profile-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats-section {
    margin-top: 20px;
  }
}
</style>
