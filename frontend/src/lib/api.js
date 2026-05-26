import axios from 'axios'

// In production (Vercel), use the Railway backend URL directly
// In development, use Vite proxy (/api -> localhost:8081)
const baseURL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_token')
      localStorage.removeItem('sf_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
