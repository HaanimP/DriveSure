<template>
  <div class="payment-page">
    <div class="payment-container">
      <button class="back-btn" @click="goBack">← Back</button>
      
      <div class="payment-content">
        <div class="payment-header">
          <h1>Complete Your Payment</h1>
          <p class="plan-selected">Selected Plan: <strong>{{ selectedPlan }}</strong></p>
        </div>

        <div class="payment-card">
          <div class="payment-section">
            <h2>📋 Banking Details</h2>
            <div class="bank-details">
              <div class="detail-row">
                <label>Bank:</label>
                <div class="detail-value">FNB / RMB</div>
              </div>
              <div class="detail-row">
                <label>Account Holder:</label>
                <div class="detail-value">Fagrie Pietersen</div>
              </div>
              <div class="detail-row">
                <label>Account Number:</label>
                <div class="detail-value copy-able" @click="copyToClipboard('62877752991')">
                  62877752991
                  <span class="copy-icon">📋</span>
                </div>
              </div>
              <div class="detail-row">
                <label>Branch Code:</label>
                <div class="detail-value copy-able" @click="copyToClipboard('250655')">
                  250655
                  <span class="copy-icon">📋</span>
                </div>
              </div>
              <div class="detail-row">
                <label>Your Reference:</label>
                <div class="detail-value copy-able" @click="copyToClipboard(userEmail)">
                  {{ userEmail }}
                  <span class="copy-icon">📋</span>
                </div>
              </div>
            </div>
          </div>

          <div class="payment-steps">
            <h2>📝 Next Steps</h2>
            <div class="steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>Transfer Payment</h3>
                  <p>Use the banking details above to make a bank transfer. Use your email as the reference.</p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>Send Proof of Payment</h3>
                  <p>Send a screenshot of your transfer to WhatsApp: <strong>0839958822</strong></p>
                </div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h3>Specify Your Request</h3>
                  <p>After confirmation, fill in the details of the vehicle you're looking for.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="whatsapp-section">
            <h3>💬 WhatsApp Number</h3>
            <a :href="whatsappLink" target="_blank" class="whatsapp-btn">
              Send on WhatsApp 📱
            </a>
            <p class="alternative-text">Or manually: 0839958822 / +27 83 995 8822</p>
          </div>

          <button class="confirm-btn" @click="proceedToForm">
            I've Sent the Proof of Payment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const selectedPlan = ref('')
    const userEmail = ref('')
    const copied = ref('')
    const whatsappLink = ref('')

    onMounted(() => {
      selectedPlan.value = sessionStorage.getItem('selectedPlan') || 'Premium'
      const user = JSON.parse(localStorage.getItem('driveSureUser') || '{}')
      userEmail.value = user.email || 'your-email@example.com'
      
      // Create pre-formatted WhatsApp message
      const message = `Hello, I am sending proof of payment for my ${selectedPlan.value} plan with DriveSure. Please find the screenshot attached. My reference: ${userEmail.value}`
      const encodedMessage = encodeURIComponent(message)
      whatsappLink.value = `https://wa.me/27839958822?text=${encodedMessage}`
    })

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
      copied.value = text
      setTimeout(() => (copied.value = ''), 2000)
    }

    const goBack = () => {
      router.back()
    }

    const proceedToForm = () => {
      router.push('/car-request')
    }

    return {
      selectedPlan,
      userEmail,
      copyToClipboard,
      goBack,
      proceedToForm,
      copied,
      whatsappLink
    }
  }
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #0d1f3c 0%, #1a3a6b 50%, #0d1f3c 100%);
  padding: 2rem;
  padding-top: 100px;
}

body.dark-mode .payment-page {
  background: linear-gradient(160deg, #0f0f0f 0%, #1a2a3a 50%, #0f0f0f 100%);
}

.payment-container {
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

.payment-content {
  animation: slideUp 0.6s ease;
}

.payment-header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.payment-header h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}

.plan-selected {
  font-size: 1.1rem;
  color: #c0392b;
}

.payment-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow-med);
}

.payment-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--gray-light);
}

.payment-section h2 {
  color: var(--text);
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bank-details {
  display: grid;
  gap: 1rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 4px solid var(--blue);
}

.detail-row label {
  font-weight: 600;
  color: var(--gray);
  font-size: 0.9rem;
}

.detail-value {
  font-size: 1.1rem;
  color: var(--text);
  font-weight: 600;
  word-break: break-all;
}

.detail-value.copy-able {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
  padding: 0.5rem;
  border-radius: 4px;
}

.detail-value.copy-able:hover {
  background: #e8eef8;
}

.copy-icon {
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.9rem;
}

.detail-value.copy-able:hover .copy-icon {
  opacity: 1;
}

.payment-steps {
  margin-bottom: 2rem;
}

.payment-steps h2 {
  color: #1a3a6b;
}

.steps {
  display: grid;
  gap: 1.5rem;
}

.step {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 1rem;
  padding: 1rem;
  background: #f0f4ff;
  border-radius: 8px;
  border-left: 4px solid #c0392b;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #c0392b;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.3rem;
}

.step-content h3 {
  color: #1a3a6b;
  margin-bottom: 0.3rem;
  font-size: 1rem;
}

.step-content p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

.whatsapp-section {
  background: #e8f5e9;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.whatsapp-section h3 {
  color: #2e7d32;
  margin-bottom: 1rem;
}

.whatsapp-btn {
  display: inline-block;
  background: #25d366;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  margin-bottom: 1rem;
  cursor: pointer;
  border: none;
  font-size: 1rem;
}

.whatsapp-btn:hover {
  background: #20ba61;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.alternative-text {
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.confirm-btn {
  width: 100%;
  padding: 1rem;
  background: #1a3a6b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'DM Sans', sans-serif;
}

.confirm-btn:hover {
  background: #0d1f3c;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 58, 107, 0.3);
}

@media (max-width: 1024px) {
  .payment-container {
    padding: 2rem 1.5rem;
  }

  .payment-card {
    padding: 1.75rem;
    border-radius: 12px;
  }

  .detail-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .step {
    grid-template-columns: 45px 1fr;
    gap: 0.85rem;
    padding: 0.9rem;
  }

  .step-number {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }

  .whatsapp-section {
    padding: 1.25rem;
  }

  .whatsapp-btn {
    padding: 0.75rem 1.75rem;
  }
}

@media (max-width: 768px) {
  .payment-container {
    padding: 1.5rem;
    padding-top: 90px;
  }

  .payment-header h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .payment-header p {
    font-size: 0.9rem;
  }

  .payment-card {
    padding: 1.5rem;
    border-radius: 10px;
  }

  .full-details {
    margin-bottom: 1.5rem;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }

  .detail-item {
    padding: 0.85rem;
  }

  .detail-label {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }

  .detail-value {
    font-size: 0.95rem;
  }

  .bank-details {
    padding: 1.25rem;
  }

  .bank-details h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .payment-steps {
    margin-bottom: 1.5rem;
  }

  .payment-steps h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .step {
    grid-template-columns: 42px 1fr;
    gap: 0.75rem;
    padding: 0.85rem;
    border-radius: 8px;
  }

  .step-number {
    width: 42px;
    height: 42px;
    font-size: 1rem;
  }

  .step-content h3 {
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .step-content p {
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .whatsapp-section {
    padding: 1.15rem;
    margin-bottom: 1.5rem;
  }

  .whatsapp-section h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .whatsapp-btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
  }

  .alternative-text {
    font-size: 0.8rem;
  }

  .confirm-btn {
    padding: 0.85rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 600px) {
  .payment-container {
    padding: 1rem;
    padding-top: 75px;
  }

  .payment-header h1 {
    font-size: 1.25rem;
  }

  .payment-header p {
    font-size: 0.85rem;
  }

  .payment-card {
    padding: 1.25rem;
    border-radius: 8px;
  }

  .summary-title {
    font-size: 0.95rem;
  }

  .summary-content {
    gap: 0.6rem;
  }

  .summary-item {
    padding: 0.6rem 0;
    font-size: 0.9rem;
  }

  .summary-item span {
    font-size: 0.9rem;
  }

  .summary-amount {
    font-size: 1.4rem;
    margin-top: 0.75rem;
  }

  .full-details {
    margin-bottom: 1.25rem;
  }

  .detail-row {
    gap: 0.65rem;
  }

  .detail-item {
    padding: 0.75rem;
    background: #f9f9f9;
    border-radius: 6px;
  }

  .detail-label {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
    color: #666;
  }

  .detail-value {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .bank-details {
    padding: 1rem;
    margin-bottom: 1.25rem;
  }

  .bank-details h3 {
    font-size: 1rem;
    margin-bottom: 0.85rem;
  }

  .payment-steps {
    margin-bottom: 1.25rem;
  }

  .payment-steps h2 {
    font-size: 1.1rem;
    margin-bottom: 0.85rem;
  }

  .steps {
    gap: 1rem;
  }

  .step {
    grid-template-columns: 40px 1fr;
    gap: 0.65rem;
    padding: 0.75rem;
    border-radius: 8px;
  }

  .step-number {
    width: 40px;
    height: 40px;
    font-size: 0.95rem;
  }

  .step-content h3 {
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
  }

  .step-content p {
    font-size: 0.8rem;
    line-height: 1.4;
  }

  .whatsapp-section {
    padding: 1rem;
    margin-bottom: 1.25rem;
    border-radius: 8px;
  }

  .whatsapp-section h3 {
    font-size: 0.95rem;
    margin-bottom: 0.65rem;
  }

  .whatsapp-btn {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
  }

  .alternative-text {
    font-size: 0.75rem;
  }

  .confirm-btn {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 400px) {
  .payment-container {
    padding: 0.75rem;
    padding-top: 65px;
  }

  .payment-header h1 {
    font-size: 1.1rem;
  }

  .payment-header p {
    font-size: 0.8rem;
  }

  .payment-card {
    padding: 1rem;
  }

  .summary-title {
    font-size: 0.9rem;
  }

  .summary-item {
    padding: 0.5rem 0;
    font-size: 0.85rem;
  }

  .summary-amount {
    font-size: 1.25rem;
  }

  .detail-item {
    padding: 0.65rem;
  }

  .detail-label {
    font-size: 0.75rem;
  }

  .detail-value {
    font-size: 0.85rem;
  }

  .bank-details {
    padding: 0.85rem;
  }

  .step-number {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }

  .step-content h3 {
    font-size: 0.85rem;
  }

  .step-content p {
    font-size: 0.75rem;
  }

  .confirm-btn {
    padding: 0.65rem;
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
