<template>
  <section id="contact" class="contact-section">
    <div class="container">
      <div style="padding: 1.5rem 0;">
        <div class="contact-grid">
          <div class="contact-info">
            <h3>Get in Touch</h3>
            <p style="margin-bottom: 2rem; color: rgba(255,255,255,0.75);">Have questions? Our team is here to help you find the perfect vehicle.</p>
            
            <div class="contact-item">
              <div class="contact-icon">📞</div>
              <div>
                <strong>Phone</strong>
                <p>+27 839 958 822</p>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">📧</div>
              <div>
                <strong>Email</strong>
                <p>drivesure13@gmail.com</p>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">📍</div>
              <div>
                <strong>Address</strong>
                <p>Cape Town, South Africa</p>
              </div>
            </div>

            <div class="contact-item">
              <div class="contact-icon">⏰</div>
              <div>
                <strong>Business Hours</strong>
                <p>Monday - Friday: 09:00 - 16:00<br>Saturday: 09:00 - 12:00</p>
              </div>
            </div>
          </div>

          <div class="contact-form">
            <h3>Send us a Message</h3>
            <form @submit.prevent="submitContact">
              <div class="form-group">
                <label>Full Name</label>
                <input v-model="form.name" type="text" placeholder="Your name" required>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="your@email.com" required>
              </div>
              <div class="form-group">
                <label>Subject</label>
                <input v-model="form.subject" type="text" placeholder="How can we help?" required>
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea v-model="form.message" placeholder="Your message here..." required></textarea>
              </div>
              <button type="submit" class="submit-btn">Send Message</button>
            </form>
            <div v-if="contactMessage" :class="['alert', contactMessage.type]">{{ contactMessage.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'
import api from '../api'

export default {
  setup() {
    const form = ref({ name: '', email: '', subject: '', message: '' })
    const contactMessage = ref(null)

    const submitContact = async () => {
      try {
        await api.post('/contact', form.value)
        contactMessage.value = { type: 'success', text: 'Message sent successfully!' }
        form.value = { name: '', email: '', subject: '', message: '' }
        setTimeout(() => { contactMessage.value = null }, 3000)
      } catch (err) {
        contactMessage.value = { type: 'error', text: 'Failed to send message. Please try again.' }
      }
    }

    return { form, contactMessage, submitContact }
  }
}
</script>

