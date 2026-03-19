import axios from 'axios'

// In production builds, set VITE_API_BASE_URL in your .env.production file
// e.g. VITE_API_BASE_URL=https://api.yourdomain.com
// In development, Vite proxies /api to http://localhost:5000 via vite.config.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}`
  : '/api'

// const BASE_URL = 'http://122.163.121.176:3004/api'

// console.log(import.meta.env.VITE_API_BASE_URL)
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min for long analyses
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.error || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export const analyzeFiles = (files) => {
  const form = new FormData()
  files.forEach(f => form.append('files', f))
  return api.post('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getProcess = (id) => api.get(`/processes/${id}`)
export const listProcesses = () => api.get('/processes')
export const getAutomation = (id) => api.get(`/processes/${id}/automation`)

export default api
