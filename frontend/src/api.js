import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://drivesure-production.up.railway.app/api'

const apiClient = axios.create({
  baseURL: API_URL
})

// Add token to headers if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'API Error'
    return Promise.reject(new Error(message))
  }
)

export default apiClient
