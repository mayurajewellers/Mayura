import { STORAGE_KEYS } from '@constants/routes'
import apiClient from './apiClient'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.insider)) ?? []
  } catch {
    return []
  }
}

export const newsletterService = {
  validate(email) {
    if (!email || !email.trim()) return 'Please enter your email address.'
    if (!EMAIL_RE.test(email.trim())) return 'That does not look like a valid email address.'
    return null
  },

  isSubscribed(email) {
    return read().some((entry) => entry.email === email.trim().toLowerCase())
  },

  /**
   * Subscribe to Mayura Insiders newsletter via POST /api/v1/insiders
   */
  async subscribe({ email, segment = null }) {
    const error = this.validate(email)
    if (error) return { ok: false, error }

    const normalised = email.trim().toLowerCase()

    try {
      const response = await apiClient.post('/insiders', {
        email: normalised,
        segment: segment || 'website',
      })

      if (response.success) {
        const alreadySubscribed = Boolean(response.data?.alreadySubscribed)

        // Store local entry for immediate UI feedback
        const entries = read()
        if (!entries.some((entry) => entry.email === normalised)) {
          entries.push({ email: normalised, segment, at: new Date().toISOString() })
          try {
            window.localStorage.setItem(STORAGE_KEYS.insider, JSON.stringify(entries))
          } catch {
            /* storage blocked */
          }
        }

        return { ok: true, alreadySubscribed }
      } else if (response.message) {
        return { ok: false, error: response.message }
      }
    } catch (err) {
      // Offline fallback
    }

    // Client-side fallback if backend API is unreachable
    const entries = read()
    if (entries.some((entry) => entry.email === normalised)) {
      return { ok: true, alreadySubscribed: true }
    }

    entries.push({ email: normalised, segment, at: new Date().toISOString() })
    try {
      window.localStorage.setItem(STORAGE_KEYS.insider, JSON.stringify(entries))
    } catch {
      return { ok: false, error: 'Could not save your signup on this device. Please try again.' }
    }
    return { ok: true, alreadySubscribed: false }
  },

  /**
   * Admin: Get paginated newsletter subscribers
   * GET /api/v1/admin/insiders
   */
  async getAdminNewsletter(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/insiders${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch subscribers',
        subscribers: [],
        pagination: null,
      }
    }

    const rawSubscribers = response.data?.subscribers || response.data || []
    return {
      success: true,
      subscribers: Array.isArray(rawSubscribers) ? rawSubscribers : [],
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Admin: Get single subscriber detail
   * GET /api/v1/admin/insiders/:id
   */
  async getSubscriberById(id) {
    if (!id) return { success: false, message: 'Subscriber ID is required', subscriber: null }

    const response = await apiClient.get(`/admin/insiders/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.subscriber) {
      return {
        success: false,
        message: response.message || 'Subscriber details not found',
        subscriber: null,
      }
    }

    return {
      success: true,
      subscriber: response.data.subscriber,
    }
  },

  /**
   * Admin: Update subscriber status (SUBSCRIBED / UNSUBSCRIBED)
   * PUT /api/v1/admin/insiders/:id
   */
  async updateSubscriberStatus(id, payload) {
    if (!id) return { success: false, message: 'Subscriber ID is required' }

    const response = await apiClient.put(`/admin/insiders/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update subscriber',
        subscriber: null,
      }
    }

    return {
      success: true,
      message: response.message || 'Subscriber updated successfully',
      subscriber: response.data?.subscriber || response.data,
    }
  },

  /**
   * Admin: Deactivate / soft delete subscriber
   * DELETE /api/v1/admin/insiders/:id
   */
  async deleteSubscriber(id) {
    if (!id) return { success: false, message: 'Subscriber ID is required' }

    const response = await apiClient.delete(`/admin/insiders/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete subscriber',
      }
    }

    return {
      success: true,
      message: response.message || 'Subscriber deactivated successfully',
    }
  },
}

export default newsletterService
