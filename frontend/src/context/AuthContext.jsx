import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, fetchMe } from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('kaam_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const access = localStorage.getItem('kaam_access')
    if (access) {
      fetchMe()
        .then(({ data }) => {
          setUser(data)
          localStorage.setItem('kaam_user', JSON.stringify(data))
        })
        .catch(() => {
          localStorage.removeItem('kaam_access')
          localStorage.removeItem('kaam_refresh')
          localStorage.removeItem('kaam_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const { data } = await loginUser({ username, password })
    localStorage.setItem('kaam_access', data.access)
    localStorage.setItem('kaam_refresh', data.refresh)
    localStorage.setItem('kaam_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    await registerUser(payload)
    return login(payload.username, payload.password)
  }

  const logout = () => {
    localStorage.removeItem('kaam_access')
    localStorage.removeItem('kaam_refresh')
    localStorage.removeItem('kaam_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
