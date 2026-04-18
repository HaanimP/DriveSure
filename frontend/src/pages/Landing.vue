<template>
  <div class="landing">
    <hero-section @login="$emit('login')" />
    <plans-section @select-plan="selectPlan" />
    <reviews-section />
    <contact-section />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import PlansSection from '../components/PlansSection.vue'
import ReviewsSection from '../components/ReviewsSection.vue'
import ContactSection from '../components/ContactSection.vue'

export default {
  components: {
    HeroSection,
    PlansSection,
    ReviewsSection,
    ContactSection
  },
  emits: ['login'],
  setup() {
    const router = useRouter()

    const selectPlan = (planName) => {
      sessionStorage.setItem('selectedPlan', planName)
      router.push('/customer')
    }

    return {
      selectPlan
    }
  }
}
</script>

<style scoped>
.landing {
  background: linear-gradient(160deg, #0d1f3c 0%, #1a3a6b 50%, #0d1f3c 100%);
  color: white;
}
</style>
