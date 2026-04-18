<template>
  <div class="hero">
    <div class="hero-stripes"></div>
    <div class="hero-cars"></div>
    <div class="hero-content">
      <div class="hero-badge">🚗 Trusted Vehicle Sourcing</div>
      <h1>Find Your Perfect <span>Drive</span></h1>
      <p class="hero-tagline">Where Dreams Meet the Road</p>
      <p>Professional vehicle sourcing and after-sales support all in one place</p>
      <div class="hero-btns">
        <button class="btn-primary" @click="$emit('login')">Get Started</button>
        <button class="btn-secondary" @click="scrollToContact">Contact</button>
      </div>
    </div>
    <div class="scroll-indicator">
      <span>SCROLL</span>
      <div class="scroll-arrow">↓</div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['login', 'learn-more'],
  setup(props, { emit }) {
    const scrollToContact = () => {
      const contactSection = document.querySelector('#contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
    return { scrollToContact }
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  z-index: 1;
}
</style>
