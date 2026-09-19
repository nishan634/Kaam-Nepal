import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_BASE_URL,
})

client.interceptors.request.use((config) => {
  const access = localStorage.getItem('kaam_access')
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

let isRefreshing = false
let queue = []

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refresh = localStorage.getItem('kaam_refresh')
      if (!refresh) {
        localStorage.removeItem('kaam_access')
        return Promise.reject(error)
      }
      originalRequest._retry = true
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return client(originalRequest)
        })
      }
      isRefreshing = true
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh })
        localStorage.setItem('kaam_access', data.access)
        queue.forEach((p) => p.resolve(data.access))
        queue = []
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return client(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('kaam_access')
        localStorage.removeItem('kaam_refresh')
        localStorage.removeItem('kaam_user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default client
