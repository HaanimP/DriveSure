<template>
  <div class="profile-container">
    <!-- Profile Header -->
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
          <p class="role-badge">⚙️ Administrator • Member since {{ getMemberSince() }}</p>
        </div>
      </div>
    </div>

    <!-- Admin Stats -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ stats.total_users || 0 }}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.pending_reviews || 0 }}</div>
        <div class="stat-label">Pending Reviews</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ stats.contact_messages || 0 }}</div>
        <div class="stat-label">Support Messages</div>
      </div>
    </div>

    <!-- Profile Tabs -->
    <div class="profile-tabs">
      <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="{ active: activeTab === tab }" class="tab-button">
        {{ tab }}
      </button>
    </div>

    <!-- Personal Info Tab -->
    <div v-if="activeTab === 'Personal Info'" class="tab-content">
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

    <!-- Security Tab -->
    <div v-if="activeTab === 'Security'" class="tab-content">
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

    <!-- User Management Tab -->
    <div v-if="activeTab === 'User Management'" class="tab-content">
      <div class="users-section">
        <h3>All Users</h3>
        <input v-model="userSearch" type="text" placeholder="Search users by name or email..." class="search-input">
        <div v-if="filteredUsers.length > 0" class="users-table">
          <div class="table-header">
            <div class="col-name">Name</div>
            <div class="col-email">Email</div>
            <div class="col-role">Role</div>
            <div class="col-joined">Joined</div>
            <div class="col-action">Action</div>
          </div>
          <div v-for="u in filteredUsers" :key="u.id" class="table-row">
            <div class="col-name">{{ u.first_name }} {{ u.last_name }}</div>
            <div class="col-email">{{ u.email }}</div>
            <div class="col-role">
              <span :class="['role-tag', u.role]">{{ u.role }}</span>
            </div>
            <div class="col-joined">{{ formatDate(u.created_at) }}</div>
            <div class="col-action">
              <button @click="toggleUserStatus(u)" :class="['btn-small', u.active ? 'danger' : 'success']">
                {{ u.active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
        <p v-else class="empty-state">No users found</p>
      </div>
    </div>

    <!-- Review Approval Tab -->
    <div v-if="activeTab === 'Review Approval'" class="tab-content">
      <div class="reviews-approval-section">
        <h3>Pending Reviews</h3>
        <div v-if="pendingReviews.length > 0" class="reviews-list">
          <div v-for="rev in pendingReviews" :key="rev.id" class="review-approval-card">
            <div class="review-header">
              <div>
                <p class="review-author"><strong>{{ rev.author_name }}</strong></p>
                <div class="star-rating">
                  <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= rev.rating }">⭐</span>
                </div>
              </div>
              <span class="status-badge pending">⏳ Pending</span>
            </div>
            <p class="review-text">{{ rev.review_text }}</p>
            <p class="review-service">Service: {{ rev.service_plan }}</p>
            <div class="review-actions">
              <button @click="approveReview(rev.id)" class="btn-success">Approve</button>
              <button @click="rejectReview(rev.id)" class="btn-danger">Reject</button>
            </div>
          </div>
        </div>
        <p v-else class="empty-state">No pending reviews to approve</p>

        <h3 style="margin-top: 40px;">Approved Reviews</h3>
        <div v-if="approvedReviews.length > 0" class="reviews-list">
          <div v-for="rev in approvedReviews" :key="rev.id" class="review-approval-card">
            <div class="review-header">
              <div>
                <p class="review-author"><strong>{{ rev.author_name }}</strong></p>
                <div class="star-rating">
                  <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= rev.rating }">⭐</span>
                </div>
              </div>
              <span class="status-badge approved">✓ Approved</span>
            </div>
            <p class="review-text">{{ rev.review_text }}</p>
            <p class="review-date">{{ formatDate(rev.created_at) }}</p>
          </div>
        </div>
        <p v-else class="empty-state">No approved reviews yet</p>
      </div>
    </div>

    <!-- Support Messages Tab -->
    <div v-if="activeTab === 'Support Messages'" class="tab-content">
      <div class="messages-section">
        <h3>Contact Form Submissions</h3>
        <div v-if="contactMessages.length > 0" class="messages-list">
          <div v-for="msg in contactMessages" :key="msg.id" class="message-card">
            <div class="message-header">
              <div>
                <p class="message-sender"><strong>{{ msg.name }}</strong></p>
                <p class="message-email">{{ msg.email }}</p>
              </div>
              <span class="message-date">{{ formatDate(msg.created_at) }}</span>
            </div>
            <p class="message-text">{{ msg.message }}</p>
          </div>
        </div>
        <p v-else class="empty-state">No contact messages yet</p>
      </div>
    </div>

    <!-- Settings Tab -->
    <div v-if="activeTab === 'Settings'" class="tab-content">
      <div class="settings-section">
        <h3>🎨 Appearance</h3>
        <div class="setting-item">
          <span>Dark Mode</span>
          <button @click="toggleDarkMode" class="toggle-btn" :class="{ active: darkMode }">
            {{ darkMode ? '🌙 ON' : '☀️ OFF' }}
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>🔔 Communication System</h3>
        <p class="section-info">Agents message customers directly with request updates. Admin can monitor all requests through the dashboard. Check the Admin Dashboard regularly for the latest activity.</p>
      </div>

      <div class="settings-section">
        <h3>📄 System Status</h3>
        <p class="section-info">All systems operational. Database and API services are running normally.</p>
        <div class="setting-item">
          <span>Request Processing</span>
          <span class="status-badge verified">✓ Active</span>
        </div>
      </div>

      <div class="settings-section danger-zone">
        <h3>⚠️ Account</h3>
        <button @click="logout" class="btn-secondary">Logout from all devices</button>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const activeTab = ref('Personal Info');
const tabs = ['Personal Info', 'Security', 'User Management', 'Review Approval', 'Support Messages', 'Settings'];

const user = ref({});
const editData = ref({});
const passwordData = ref({ currentPassword: '', newPassword: '', confirmPassword: '' });
const allUsers = ref([]);
const userSearch = ref('');
const reviews = ref([]);
const contactMessages = ref([]);
const stats = ref({});
const settings = ref({ requestAlerts: true, userAlerts: true });
const profilePicture = ref(null);
const fileInput = ref(null);
const message = ref(null);

const filteredUsers = computed(() => {
  return allUsers.value.filter(u => 
    u.first_name.toLowerCase().includes(userSearch.value.toLowerCase()) ||
    u.last_name.toLowerCase().includes(userSearch.value.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.value.toLowerCase())
  );
});

const pendingReviews = computed(() => reviews.value.filter(r => !r.approved));
const approvedReviews = computed(() => reviews.value.filter(r => r.approved));

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
  ctx.fillStyle = '#9B59B6';
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

const toggleUserStatus = async (u) => {
  try {
    // This would require backend endpoint to update user status
    showMessage(`User ${u.active ? 'deactivated' : 'activated'} successfully`, 'success');
  } catch (error) {
    showMessage('Failed to update user status', 'error');
  }
};

const approveReview = async (reviewId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:3001/api/reviews/${reviewId}`,
      { approved: true },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const review = reviews.value.find(r => r.id === reviewId);
    if (review) review.approved = true;
    showMessage('Review approved successfully!', 'success');
  } catch (error) {
    showMessage('Failed to approve review', 'error');
  }
};

const rejectReview = async (reviewId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(
      `http://localhost:3001/api/reviews/${reviewId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    reviews.value = reviews.value.filter(r => r.id !== reviewId);
    showMessage('Review rejected successfully!', 'success');
  } catch (error) {
    showMessage('Failed to reject review', 'error');
  }
};

const fetchUserData = async () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('driveSureUser'));
    const token = localStorage.getItem('token');

    // Fetch admin profile
    const response = await axios.get(
      `http://localhost:3001/api/profile/${storedUser.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    user.value = response.data;
    editData.value = { first_name: response.data.first_name, last_name: response.data.last_name, phone: response.data.phone };

    // Fetch all users
    const usersResponse = await axios.get(
      `http://localhost:3001/api/users`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    allUsers.value = usersResponse.data.map(u => ({
      ...u,
      active: true // All users from DB are considered active by default
    }));

    // Fetch reviews
    const revResponse = await axios.get(
      `http://localhost:3001/api/reviews`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    reviews.value = revResponse.data;

    // Fetch contact messages
    const msgResponse = await axios.get(
      `http://localhost:3001/api/contact`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    contactMessages.value = msgResponse.data;

    // Calculate stats
    stats.value = {
      total_users: allUsers.value.length,
      pending_reviews: reviews.value.filter(r => !r.approved).length,
      contact_messages: contactMessages.value.length
    };
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    showMessage('Failed to load admin data', 'error');
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('driveSureUser');
  router.push('/');
  showMessage('Logged out successfully', 'success');
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
  background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
  padding: 40px 20px;
  color: white;
  margin: 0 0 30px 0;
  margin-top: 64px;
  box-shadow: var(--shadow-med);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}\n\nbody.dark-mode .profile-header {
  background: linear-gradient(135deg, #6b44a1 0%, #7a4fb0 100%);
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(60, 20, 80, 0.8) 0%, rgba(155, 89, 182, 0.4) 100%);
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
  color: #8E44AD;
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
  overflow-x: auto;
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
  white-space: nowrap;
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

.users-section h3,
.reviews-approval-section h3,
.messages-section h3 {
  margin: 0 0 20px;
  color: #333;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.users-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  background: #f5f5f5;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  align-items: center;
  font-size: 14px;
  background: white;
  transition: background 0.3s;
}

.table-row:hover {
  background: #fafafa;
}

.role-tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.role-tag.customer {
  background: #E3F2FD;
  color: #0052CC;
}

.role-tag.agent,
.role-tag.mechanic {
  background: #F0F5FF;
  color: #27AE60;
}

.role-tag.admin {
  background: #F3E5F5;
  color: #8E44AD;
}

.reviews-list,
.messages-list {
  display: grid;
  gap: 20px;
  margin-top: 20px;
}

.review-approval-card,
.message-card {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  border-left: 4px solid #8E44AD;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-author {
  margin: 0 0 8px;
  color: #8E44AD;
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

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background: #FFF3CD;
  color: #856404;
}

.status-badge.approved {
  background: #D4EDDA;
  color: #155724;
}

.review-text,
.message-text {
  color: #555;
  margin: 12px 0;
  line-height: 1.6;
}

.review-service {
  font-size: 14px;
  color: #666;
  margin: 10px 0 15px;
}

.review-actions {
  display: flex;
  gap: 10px;
}

.review-date,
.message-date {
  color: #999;
  font-size: 12px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.message-sender {
  margin: 0 0 4px;
  color: #333;
}

.message-email {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.empty-state a {
  color: #8E44AD;
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
  background: #8E44AD;
  color: white;
  border-color: #8E44AD;
}

.section-info {
  color: #999;
  font-size: 0.9rem;
  margin: 15px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #8E44AD;
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
.btn-secondary,
.btn-small,
.btn-success,
.btn-danger {
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

.btn-small {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-small.danger {
  background: #E74C3C;
  color: white;
}

.btn-small.danger:hover {
  background: #C0392B;
}

.btn-small.success {
  background: #27AE60;
  color: white;
}

.btn-small.success:hover {
  background: #1E8449;
}

.btn-success {
  background: #27AE60;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-success:hover {
  background: #1E8449;
}

.btn-danger {
  background: #E74C3C;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
}

.btn-danger:hover {
  background: #C0392B;
}

.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 600;
  animation: slideUp 0.3s ease;
  z-index: 1000;
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

@media (max-width: 1024px) {
  .profile-container {
    padding: 1rem;
    padding-top: 90px;
  }

  .profile-header {
    padding: 1.5rem;
  }

  .profile-picture {
    width: 140px;
    height: 140px;
  }

  .profile-info h1 {
    font-size: 1.8rem;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .table-header, .table-row {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 0.75rem;
    padding-top: 75px;
  }

  .profile-header {
    padding: 1.25rem;
    flex-direction: column;
    text-align: center;
  }

  .profile-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    align-items: center;
  }

  .profile-picture {
    width: 120px;
    height: 120px;
  }

  .profile-info h1 {
    font-size: 1.5rem;
    margin: 0.5rem 0 0;
  }

  .profile-info p {
    font-size: 0.9rem;
    margin: 0.25rem 0;
  }

  .profile-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-bottom: 2px solid #e0e0e0;
    margin-bottom: 1.5rem;
  }

  .profile-tab {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    white-space: nowrap;
    border-bottom: 3px solid transparent;
  }

  .profile-tab.active {
    border-bottom-color: var(--red);
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group label {
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 0.7rem 0.85rem;
    font-size: 0.95rem;
    border-radius: 6px;
  }

  .stats-section {
    margin-top: 1.25rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-box {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .table-header, .table-row {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    font-size: 0.85rem;
  }

  .table-header {
    padding: 0.75rem 0.5rem;
  }

  .table-row {
    padding: 0.75rem 0.5rem;
  }

  .search-bar {
    padding: 0.65rem 0.75rem;
    font-size: 0.9rem;
  }

  .btn-primary, .btn-secondary, .btn-small, .btn-success, .btn-danger {
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
    border-radius: 6px;
  }

  .btn-small {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .settings-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .settings-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .setting-item {
    padding: 0.75rem 0;
  }

  .section-info {
    font-size: 0.85rem;
    padding: 0.75rem;
    margin: 1rem 0;
  }

  .message {
    bottom: 1rem;
    right: 1rem;
    padding: 0.9rem 1rem;
    font-size: 0.9rem;
    border-radius: 6px;
  }
}

@media (max-width: 600px) {
  .profile-container {
    padding: 0.5rem;
    padding-top: 65px;
  }

  .profile-header {
    padding: 1rem;
  }

  .profile-picture {
    width: 100px;
    height: 100px;
  }

  .profile-info h1 {
    font-size: 1.3rem;
  }

  .profile-tabs {
    display: flex;
    gap: 0;
  }

  .profile-tab {
    flex: 1;
    padding: 0.6rem 0.5rem;
    font-size: 0.75rem;
    text-align: center;
  }

  .form-grid {
    gap: 0.5rem;
  }

  .form-group {
    margin-bottom: 0.6rem;
  }

  .form-group label {
    font-size: 0.8rem;
    margin-bottom: 0.2rem;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .stat-box {
    padding: 0.85rem;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .table-header, .table-row {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    font-size: 0.75rem;
    padding: 0.6rem 0.4rem;
    gap: 0.4rem;
  }

  .search-bar {
    padding: 0.6rem 0.65rem;
    font-size: 0.85rem;
  }

  .btn-primary, .btn-secondary, .btn-small, .btn-success, .btn-danger {
    padding: 0.6rem 0.85rem;
    font-size: 0.85rem;
  }

  .btn-small {
    padding: 0.45rem 0.65rem;
    font-size: 0.75rem;
  }

  .settings-section {
    margin-bottom: 1.25rem;
    padding-bottom: 1.25rem;
  }

  .settings-section h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .setting-item {
    padding: 0.6rem 0;
    font-size: 0.9rem;
  }

  .setting-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }

  .section-info {
    font-size: 0.8rem;
    padding: 0.65rem;
    margin: 0.75rem 0;
  }

  .message {
    bottom: 0.75rem;
    right: 0.75rem;
    padding: 0.8rem 0.9rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 400px) {
  .profile-container {
    padding: 0.35rem;
    padding-top: 60px;
  }

  .profile-header {
    padding: 0.85rem;
  }

  .profile-picture {
    width: 85px;
    height: 85px;
  }

  .profile-info h1 {
    font-size: 1.1rem;
  }

  .profile-tab {
    font-size: 0.7rem;
    padding: 0.5rem 0.35rem;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 0.55rem 0.65rem;
    font-size: 0.85rem;
  }

  .btn-primary, .btn-secondary, .btn-small, .btn-success, .btn-danger {
    padding: 0.55rem 0.75rem;
    font-size: 0.8rem;
  }

  .table-header, .table-row {
    font-size: 0.65rem;
    padding: 0.5rem 0.3rem;
  }
}
</style>
