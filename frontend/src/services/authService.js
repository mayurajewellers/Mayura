import { STORAGE_KEYS } from '@constants/routes'
import apiClient from './apiClient'

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.auth)) ?? { users: [], session: null }
  } catch {
    return { users: [], session: null }
  }
}

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mayura:auth:changed', { detail: authService.currentUser() }))
  }
}

const write = (state) => {
  try {
    window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(state))
    notifyAuthChange()
  } catch {
    /* storage unavailable */
  }
}

async function digest(text) {
  if (!window.crypto?.subtle) return `plainfallback:${text.length}:${text.slice(0, 2)}`
  const data = new TextEncoder().encode(`mayura-demo::${text}`)
  const hash = await window.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const authService = {
  /**
   * Returns current authenticated user object or null
   */
  currentUser() {
    const { users, session } = read()
    if (session && session.user) {
      const u = session.user
      return {
        ...u,
        role: (u.role || 'CUSTOMER').toUpperCase(),
      }
    }
    if (session && session.email) {
      const match = users.find((u) => u.email === session.email)
      if (match) {
        return {
          name: match.name,
          email: match.email,
          phone: match.phone || '',
          role: (match.role || 'CUSTOMER').toUpperCase(),
          addresses: match.addresses || [],
        }
      }
      return {
        name: session.email.split('@')[0],
        email: session.email,
        phone: '',
        role: 'CUSTOMER',
        addresses: [],
      }
    }
    return null
  },

  /**
   * Returns boolean indicating if a valid user is logged in
   */
  isAuthenticated() {
    const user = this.currentUser()
    const token = window.localStorage.getItem('mayura.token.v1') || read()?.session?.token
    return Boolean(user || token)
  },

  /**
   * Returns boolean indicating if current user is an authenticated CUSTOMER
   */
  isCustomer() {
    const user = this.currentUser()
    const token = window.localStorage.getItem('mayura.token.v1') || read()?.session?.token
    if (!token) return false
    if (!user) return true // Token present, default to customer
    const role = (user.role || 'CUSTOMER').toUpperCase()
    return role !== 'ADMIN'
  },

  /**
   * Returns boolean indicating if current user is an authenticated ADMIN
   */
  isAdmin() {
    const user = this.currentUser()
    const token = window.localStorage.getItem('mayura.token.v1') || read()?.session?.token
    if (!token) return false
    if (!user) return false
    return String(user.role).toUpperCase() === 'ADMIN'
  },

  /**
   * Fetch current customer profile from GET /api/v1/auth/me
   */
  async me() {
    const token = window.localStorage.getItem('mayura.token.v1')
    if (!token) return { success: false, user: null }

    const response = await apiClient.get('/auth/me')

    if (response.success && response.data?.user) {
      const user = response.data.user
      const state = read()
      state.session = {
        email: user.email,
        token,
        user,
        startedAt: new Date().toISOString(),
      }
      write(state)
      return { success: true, user }
    }

    return { success: false, user: null }
  },

  /**
   * Update current customer profile (PUT /api/v1/auth/me)
   */
  async updateProfile({ name, phone, addresses, avatar }) {
    try {
      const response = await apiClient.put('/auth/me', { name, phone, addresses, avatar })
      if (response.success && response.data?.user) {
        const user = response.data.user
        const state = read()
        if (state.session) {
          state.session.user = { ...state.session.user, ...user }
        }
        const userMatch = state.users.find((u) => u.email === user.email)
        if (userMatch) {
          if (name) userMatch.name = name
          if (phone !== undefined) userMatch.phone = phone
          if (addresses) userMatch.addresses = addresses
        }
        write(state)
        return { success: true, user }
      }
    } catch {
      /* API unavailable, fallback local update */
    }

    // Local fallback update
    const state = read()
    if (state.session && state.session.user) {
      if (name) state.session.user.name = name
      if (phone !== undefined) state.session.user.phone = phone
      if (addresses) state.session.user.addresses = addresses
      if (avatar !== undefined) state.session.user.avatar = avatar

      const userMatch = state.users.find((u) => u.email === state.session.email)
      if (userMatch) {
        if (name) userMatch.name = name
        if (phone !== undefined) userMatch.phone = phone
        if (addresses) userMatch.addresses = addresses
      }
      write(state)
      return { success: true, user: state.session.user }
    }

    return { success: false, error: 'Could not update profile' }
  },

  /**
   * Authenticate customer with backend API (POST /api/v1/auth/login)
   */
  async signIn({ email, password }) {
    const normalised = email.trim().toLowerCase()

    try {
      const response = await apiClient.post('/auth/login', {
        email: normalised,
        password,
      })

      if (response.success && response.data?.token) {
        const token = response.data.token
        const user = response.data.user || { email: normalised, role: 'CUSTOMER' }

        window.localStorage.setItem('mayura.token.v1', token)

        const state = read()
        state.session = { email: normalised, token, user, startedAt: new Date().toISOString() }
        write(state)

        return { ok: true, success: true, user }
      } else if (response.message) {
        return { ok: false, success: false, error: response.message }
      }
    } catch (err) {
      // API call failed
    }

    // Fallback mock authentication
    const state = read()
    let user = state.users.find((u) => u.email === normalised)
    const passwordDigest = await digest(password)

    if (user && user.passwordDigest !== passwordDigest) {
      return { ok: false, success: false, error: 'That password does not match. Please try again.' }
    }

    if (!user) {
      user = {
        name: normalised.split('@')[0],
        email: normalised,
        passwordDigest,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      }
      state.users.push(user)
    }

    state.session = {
      email: normalised,
      token: `mock-jwt-token-${Date.now()}`,
      user: { name: user.name, email: user.email, phone: user.phone || '', role: 'CUSTOMER', addresses: user.addresses || [] },
      startedAt: new Date().toISOString(),
    }
    write(state)
    window.localStorage.setItem('mayura.token.v1', state.session.token)

    return { ok: true, success: true, user: state.session.user }
  },

  /**
   * Authenticate admin user with backend API (POST /api/v1/admin/auth/login)
   */
  async adminSignIn({ email, password }) {
    const normalised = email.trim().toLowerCase()

    const response = await apiClient.post('/admin/auth/login', {
      email: normalised,
      password,
    })

    if (response.success && response.data?.token) {
      const token = response.data.token
      const user = response.data.user

      if (user.role !== 'ADMIN') {
        return { ok: false, success: false, error: 'Access denied. Standard customer accounts cannot access the admin portal.' }
      }

      window.localStorage.setItem('mayura.token.v1', token)

      const state = read()
      state.session = { email: normalised, token, user, startedAt: new Date().toISOString() }
      write(state)

      return { ok: true, success: true, user }
    }

    return { ok: false, success: false, error: response.message || 'Invalid admin credentials.' }
  },

  /**
   * Register customer with backend API (POST /api/v1/auth/register)
   */
  async register({ name, email, phone, password }) {
    const normalised = email.trim().toLowerCase()

    try {
      const response = await apiClient.post('/auth/register', {
        name: name.trim(),
        email: normalised,
        phone: phone ? phone.trim() : undefined,
        password,
      })

      if (response.success && response.data?.token) {
        const token = response.data.token
        const user = response.data.user || { name: name.trim(), email: normalised, phone: phone ? phone.trim() : '', role: 'CUSTOMER' }

        window.localStorage.setItem('mayura.token.v1', token)

        const state = read()
        state.session = { email: normalised, token, user, startedAt: new Date().toISOString() }
        write(state)

        return { ok: true, success: true, user }
      } else if (response.message) {
        return { ok: false, success: false, error: response.message }
      }
    } catch (err) {
      // API call failed
    }

    const state = read()
    if (state.users.some((u) => u.email === normalised)) {
      return { ok: false, success: false, error: 'An account with this email already exists. Try signing in instead.' }
    }

    const passwordDigest = await digest(password)
    const user = {
      name: name.trim(),
      email: normalised,
      phone: phone ? phone.trim() : '',
      passwordDigest,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
    }
    state.users.push(user)

    state.session = {
      email: normalised,
      token: `mock-jwt-token-${Date.now()}`,
      user: { name: user.name, email: user.email, phone: user.phone || '', role: 'CUSTOMER' },
      startedAt: new Date().toISOString(),
    }
    write(state)
    window.localStorage.setItem('mayura.token.v1', state.session.token)

    return { ok: true, success: true, user: state.session.user }
  },

  /**
   * Request password reset via POST /api/v1/auth/forgot-password
   */
  async forgotPassword({ email }) {
    const response = await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
    return response
  },

  /**
   * Reset password via POST /api/v1/auth/reset-password
   */
  async resetPassword({ token, password }) {
    const response = await apiClient.post('/auth/reset-password', { token, password })
    return response
  },

  /**
   * Sign out current user
   */
  signOut() {
    const state = read()
    state.session = null
    write(state)
    window.localStorage.removeItem('mayura.token.v1')
    notifyAuthChange()
  },
}

export default authService
