import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sf_user')
    return stored ? JSON.parse(stored) : null
  })
  const [ready, setReady] = useState(false)

  // On mount, verify the stored token is still valid
  // If backend restarted (H2 reset), token will 401 and we clear it
  useEffect(() => {
    const token = localStorage.getItem('sf_token')
    if (!token) {
      setReady(true)
      return
    }
    api.get('/users/me')
      .then(res => {
        // Token still valid — refresh user data
        const stored = localStorage.getItem('sf_user')
        if (stored) setUser(JSON.parse(stored))
      })
      .catch(() => {
        // Token invalid or expired — clear everything
        localStorage.removeItem('sf_token')
        localStorage.removeItem('sf_user')
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('sf_token', data.token)
    localStorage.setItem('sf_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const register = useCallback(async (fullName, email, password, role) => {
    const { data } = await api.post('/auth/register', { fullName, email, password, role })
    localStorage.setItem('sf_token', data.token)
    localStorage.setItem('sf_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sf_token')
    localStorage.removeItem('sf_user')
    setUser(null)
  }, [])

  // Don't render until we've verified the token
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
