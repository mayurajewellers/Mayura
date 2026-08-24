import { useEffect, useState } from 'react'
import authService from '@services/authService'

/**
 * Reactive custom hook for auth state in components.
 * Listens to custom auth change events and local storage updates.
 */
export function useAuth() {
  const [user, setUser] = useState(() => authService.currentUser())
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated())
  const [isCustomer, setIsCustomer] = useState(() => authService.isCustomer())
  const [isAdmin, setIsAdmin] = useState(() => authService.isAdmin())

  useEffect(() => {
    const syncState = () => {
      const u = authService.currentUser()
      setUser(u)
      setIsAuthenticated(authService.isAuthenticated())
      setIsCustomer(authService.isCustomer())
      setIsAdmin(authService.isAdmin())
    }

    // Try fetching fresh data from GET /api/v1/auth/me on mount if token exists
    authService.me().then((res) => {
      if (res.success && res.user) {
        setUser(res.user)
        setIsAuthenticated(true)
        setIsCustomer(res.user.role === 'CUSTOMER')
        setIsAdmin(res.user.role === 'ADMIN')
      }
    })

    window.addEventListener('mayura:auth:changed', syncState)
    window.addEventListener('storage', syncState)

    return () => {
      window.removeEventListener('mayura:auth:changed', syncState)
      window.removeEventListener('storage', syncState)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isCustomer,
    isAdmin,
    logout: () => authService.signOut(),
    updateProfile: (data) => authService.updateProfile(data),
  }
}

export default useAuth
