import { STORAGE_KEYS } from '@constants/routes'
import apiClient from './apiClient'

export const CONSULTATION_SLOTS = [
  '11:30 am', '12:30 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm',
]

const MAX_ITEMS = 5

const read = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.consultations)) ?? []
  } catch {
    return []
  }
}

export const consultationService = {
  maxItems: MAX_ITEMS,

  /** Next 14 days, excluding nothing — the store is open every day. */
  availableDates(from = new Date()) {
    const dates = []
    for (let i = 1; i <= 14; i += 1) {
      const d = new Date(from)
      d.setDate(d.getDate() + i)
      dates.push(d)
    }
    return dates
  },

  validate({ items, name, phone, date, slot }) {
    const errors = {}
    if (!items?.length) errors.items = 'Choose at least one design to look at together.'
    if (items?.length > MAX_ITEMS) errors.items = `Up to ${MAX_ITEMS} designs per consultation.`
    if (!name?.trim() || name.trim().length < 2) errors.name = 'Please tell us your name.'
    if (!/^[6-9]\d{9}$/.test((phone ?? '').replace(/\D/g, '').slice(-10))) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number.'
    }
    if (!date) errors.date = 'Pick a date that suits you.'
    if (!slot) errors.slot = 'Pick a time slot.'
    return errors
  },

  /**
   * Submit consultation booking to backend POST /api/v1/consultations
   */
  async submit(request) {
    const errors = this.validate(request)
    if (Object.keys(errors).length) return { ok: false, errors }

    const formattedDate = request.date instanceof Date
      ? request.date.toISOString().split('T')[0]
      : request.date

    const payload = {
      name: request.name.trim(),
      phone: request.phone.trim(),
      email: request.email ? request.email.trim().toLowerCase() : undefined,
      preferredDate: formattedDate,
      preferredTime: request.slot,
      consultationType: request.consultationType || 'video',
      items: Array.isArray(request.items)
        ? request.items.map((it) => (typeof it === 'object' ? (it._id || it.id || it.slug || it.name) : String(it)))
        : [],
      message: request.notes || request.message || '',
    }

    try {
      const response = await apiClient.post('/consultations', payload)

      if (response.success && response.data?.consultation) {
        const record = {
          id: response.data.consultation.referenceNumber || `VC-${Date.now().toString(36).toUpperCase()}`,
          ...request,
          submittedAt: new Date().toISOString(),
          status: response.data.consultation.status || 'requested',
        }

        // Keep local record for offline confirmation screen support
        try {
          const all = read()
          all.push(record)
          window.localStorage.setItem(STORAGE_KEYS.consultations, JSON.stringify(all))
        } catch {
          /* storage unavailable */
        }

        return { ok: true, record }
      } else if (response.message) {
        return { ok: false, errors: { form: response.message } }
      }
    } catch (err) {
      // Offline fallback
    }

    // Fallback client-only save if API call failed
    const record = {
      id: `VC-${Date.now().toString(36).toUpperCase()}`,
      ...request,
      submittedAt: new Date().toISOString(),
      status: 'requested',
    }

    try {
      const all = read()
      all.push(record)
      window.localStorage.setItem(STORAGE_KEYS.consultations, JSON.stringify(all))
    } catch {
      /* storage blocked */
    }

    return { ok: true, record }
  },

  /**
   * Admin: Get paginated video consultations
   * GET /api/v1/admin/consultations
   */
  async getAdminConsultations(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/consultations${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch consultations',
        consultations: [],
        pagination: null,
      }
    }

    const rawConsultations = response.data?.consultations || response.data || []
    return {
      success: true,
      consultations: Array.isArray(rawConsultations) ? rawConsultations : [],
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Admin: Get single consultation detail
   * GET /api/v1/admin/consultations/:id
   */
  async getConsultationById(id) {
    if (!id) return { success: false, message: 'Consultation ID is required', consultation: null }

    const response = await apiClient.get(`/admin/consultations/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.consultation) {
      return {
        success: false,
        message: response.message || 'Consultation details not found',
        consultation: null,
      }
    }

    return {
      success: true,
      consultation: response.data.consultation,
    }
  },

  /**
   * Admin: Update consultation status or notes
   * PUT /api/v1/admin/consultations/:id
   */
  async updateConsultationStatus(id, payload) {
    if (!id) return { success: false, message: 'Consultation ID is required' }

    const response = await apiClient.put(`/admin/consultations/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update consultation',
        consultation: null,
      }
    }

    return {
      success: true,
      message: response.message || 'Consultation updated successfully',
      consultation: response.data?.consultation || response.data,
    }
  },

  /**
   * Admin: Deactivate / soft delete consultation
   * DELETE /api/v1/admin/consultations/:id
   */
  async deleteConsultation(id) {
    if (!id) return { success: false, message: 'Consultation ID is required' }

    const response = await apiClient.delete(`/admin/consultations/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete consultation',
      }
    }

    return {
      success: true,
      message: response.message || 'Consultation deactivated successfully',
    }
  },
}

export default consultationService
