<template>
  <footer class="footer">
    <p>DriveSure &copy; {{ currentYear }} All rights reserved.</p>
  </footer>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const currentYear = ref(new Date().getFullYear())
    return { currentYear }
  }
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1a3a6b 0%, #2d5a9f 100%);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 0;
  text-align: center;
  border-top: 1px solid var(--red);
}

.footer p {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
}

@media (max-width: 768px) {
  .footer {
    padding: 0.5rem 0;
  }

  .footer p {
    font-size: 0.8rem;
  }
}
</style>
