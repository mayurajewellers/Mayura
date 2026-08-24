import apiClient from './apiClient'

/**
 * Domain Service for Customer Enquiries
 */
export const enquiryService = {
  /**
   * Submit customer enquiry to POST /api/v1/enquiries
   */
  async createEnquiry(payload) {
    const response = await apiClient.post('/enquiries', payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not send enquiry',
        enquiry: null,
      }
    }

    return {
      success: true,
      message: response.message || 'Enquiry submitted successfully',
      enquiry: response.data?.enquiry || response.data,
    }
  },

  /**
   * Admin: Get paginated customer enquiries
   * GET /api/v1/admin/enquiries
   */
  async getAdminEnquiries(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/enquiries${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch customer enquiries',
        enquiries: [],
        pagination: null,
      }
    }

    const rawEnquiries = response.data?.enquiries || response.data || []
    return {
      success: true,
      enquiries: Array.isArray(rawEnquiries) ? rawEnquiries : [],
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Admin: Get single enquiry detail
   * GET /api/v1/admin/enquiries/:id
   */
  async getEnquiryById(id) {
    if (!id) return { success: false, message: 'Enquiry ID is required', enquiry: null }

    const response = await apiClient.get(`/admin/enquiries/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.enquiry) {
      return {
        success: false,
        message: response.message || 'Enquiry details not found',
        enquiry: null,
      }
    }

    return {
      success: true,
      enquiry: response.data.enquiry,
    }
  },

  /**
   * Admin: Update enquiry status or admin notes
   * PUT /api/v1/admin/enquiries/:id
   */
  async updateEnquiryStatus(id, payload) {
    if (!id) return { success: false, message: 'Enquiry ID is required' }

    const response = await apiClient.put(`/admin/enquiries/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update enquiry',
        enquiry: null,
      }
    }

    return {
      success: true,
      message: response.message || 'Enquiry updated successfully',
      enquiry: response.data?.enquiry || response.data,
    }
  },

  /**
   * Admin: Deactivate / soft delete enquiry
   * DELETE /api/v1/admin/enquiries/:id
   */
  async deleteEnquiry(id) {
    if (!id) return { success: false, message: 'Enquiry ID is required' }

    const response = await apiClient.delete(`/admin/enquiries/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete enquiry',
      }
    }

    return {
      success: true,
      message: response.message || 'Enquiry deactivated successfully',
    }
  },
}

export default enquiryService
