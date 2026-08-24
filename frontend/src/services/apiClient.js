import { STORAGE_KEYS } from '@constants/routes'

const DEFAULT_API_URL = 'http://localhost:5000/api/v1'

/**
 * Get API Base URL from Vite environment variable
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_BASE_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  return DEFAULT_API_URL
}

/**
 * Get stored authentication token if present
 */
export const getAuthToken = () => {
  try {
    const token =
      window.localStorage.getItem('mayura.token.v1') ||
      window.localStorage.getItem('mayura_auth_token') ||
      window.localStorage.getItem('mayura_token') ||
      window.localStorage.getItem('token') ||
      window.localStorage.getItem(STORAGE_KEYS?.token || 'mayura.token.v1')

    if (token && typeof token === 'string' && token.trim()) {
      return token.trim()
    }

    const authRaw =
      window.localStorage.getItem(STORAGE_KEYS?.auth || 'mayura.auth.v1') ||
      window.localStorage.getItem('mayura.auth.v1')

    if (authRaw) {
      const parsed = JSON.parse(authRaw)
      if (parsed?.token) return parsed.token
      if (parsed?.session?.token) return parsed.session.token
      if (parsed?.user?.token) return parsed.user.token
    }
  } catch (err) {
    // Storage access error — fallback gracefully
  }
  return null
}

/**
 * Build request headers including optional Bearer JWT token
 */
export const getRequestHeaders = (customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...customHeaders,
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * Normalize API response and error structures
 */
const handleResponse = async (response) => {
  const status = response.status
  let body = null

  try {
    body = await response.json()
  } catch (err) {
    body = null
  }

  if (!response.ok) {
    const errorMessage =
      body?.message || body?.error || `API request failed with status ${status}`

    return {
      success: false,
      status,
      message: errorMessage,
      data: body?.data || null,
      errors: body?.errors || null,
    }
  }

  return {
    success: true,
    status,
    message: body?.message || 'Success',
    data: body?.data !== undefined ? body.data : body,
  }
}

/**
 * Centralized API Client Abstraction
 */
export const apiClient = {
  baseUrl: getApiBaseUrl(),

  /**
   * Generic request method
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${getApiBaseUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    const config = {
      method: options.method || 'GET',
      headers: getRequestHeaders(options.headers),
      ...options,
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, config)
      return await handleResponse(response)
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: error.message || 'Network error or backend unavailable',
        data: null,
      }
    }
  },

  /** GET request */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  },

  /** POST request */
  post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body })
  },

  /** PUT request */
  put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body })
  },

  /** PATCH request */
  patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body })
  },

  /** DELETE request */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  },

  /**
   * Health check helper — tests connection to GET /api/v1/health
   */
  async checkHealth() {
    return this.get('/health')
  },
}

export default apiClient
