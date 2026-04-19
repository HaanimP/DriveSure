<template>
  <section class="plans-bg" id="plans">
    <div class="container">
      <div class="section-tag">FLEXIBLE PLANS</div>
      <div class="section-divider"></div>
      <h2 class="section-title">Choose Your Plan</h2>
      <p class="section-sub">Select the perfect vehicle sourcing plan for your needs</p>

      <div class="payment-notice">
        <strong>Payment Required:</strong> All plans require payment before service begins. We accept bank transfers with secure verification. Your service starts immediately upon payment confirmation.
      </div>

      <div class="plans-grid">
        <!-- Basic Plan -->
        <div class="plan-card">
          <h3 class="plan-name">BASIC</h3>
          <div class="plan-price">R<span>300</span></div>
          <p class="plan-note">One-time sourcing fee</p>
          <ul class="plan-features">
            <li><span class="check">✓</span> Source cars for you</li>
            <li><span class="check">✓</span> Advise what you are looking for</li>
            <li><span class="check">✓</span> Negotiate for you</li>
            <li><span class="cross">✗</span> Mechanic inspection</li>
            <li><span class="cross">✗</span> Full diagnostics</li>
          </ul>
          <button class="plan-cta" @click="selectPlan('Basic')">Select Plan</button>
        </div>

        <!-- Premium Plan (Featured) -->
        <div class="plan-card featured">
          <div class="plan-badge">Most Popular</div>
          <h3 class="plan-name">PREMIUM</h3>
          <div class="plan-price">R<span>1,000</span></div>
          <p class="plan-note">Minimum - Location dependent</p>
          <ul class="plan-features">
            <li><span class="check">✓</span> Source cars for you</li>
            <li><span class="check">✓</span> Advise what you are looking for</li>
            <li><span class="check">✓</span> Negotiate for you</li>
            <li><span class="check">✓</span> Qualified mechanic accompanies</li>
            <li><span class="check">✓</span> Full car checks & evaluation</li>
            <li><span class="check">✓</span> Test drive support</li>
          </ul>
          <button class="plan-cta featured-cta" @click="selectPlan('Premium')">Select Plan</button>
        </div>

        <!-- Platinum Plan -->
        <div class="plan-card">
          <h3 class="plan-name">PLATINUM</h3>
          <div class="plan-price">R<span>1,500</span></div>
          <p class="plan-note">One-time sourcing fee</p>
          <ul class="plan-features">
            <li><span class="check">✓</span> Source cars for you</li>
            <li><span class="check">✓</span> Advise what you are looking for</li>
            <li><span class="check">✓</span> Negotiate for you</li>
            <li><span class="check">✓</span> Qualified mechanic accompanies</li>
            <li><span class="check">✓</span> Full car checks & evaluation</li>
            <li><span class="check">✓</span> Full diagnostics on car</li>
            <li><span class="check">✓</span> Test drive support</li>
          </ul>
          <button class="plan-cta" @click="selectPlan('Platinum')">Select Plan</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

export default {
  emits: ['login'],
  setup(props, { emit }) {
    const router = useRouter()

    const getAuthToken = () => {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    }

    const selectPlan = (planName) => {
      // Check if user is authenticated
      const token = getAuthToken()
      
      if (!token) {
        // User not signed in - emit login event to show modal
        emit('login')
        return
      }

      // User is authenticated - proceed with plan selection
      sessionStorage.setItem('selectedPlan', planName)
      router.push('/payment')
    }

    return { selectPlan }
  }
}
</script>


