import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sf_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('sf_token')
    if (!token) {
      setReady(true)
      return
    }
    // Verify token is still valid (backend may have restarted)
    api.get('/users/me')
      .then(() => {
        // Token valid — keep existing user state
      })
      .catch(() => {
        // Token expired/invalid — clear and force re-login
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
