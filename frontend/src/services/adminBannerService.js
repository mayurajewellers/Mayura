import apiClient from './apiClient'
import { normalizeBanner } from './bannerService'

/**
 * Domain Service for Admin Banner Operations (Phase B-06 Backend)
 */
export const adminBannerService = {
  /**
   * Fetch paginated list of banners (active & inactive) for admin management
   * GET /api/v1/admin/banners
   */
  async getAdminBanners(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/banners${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch admin banners',
        banners: [],
        pagination: null,
      }
    }

    const rawBanners = response.data?.banners || response.data || []
    const banners = Array.isArray(rawBanners)
      ? rawBanners.map(normalizeBanner).filter(Boolean)
      : []

    return {
      success: true,
      banners,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Fetch single banner by ID for admin edit form
   * GET /api/v1/admin/banners/:id
   */
  async getAdminBannerById(id) {
    if (!id) return { success: false, message: 'Banner ID is required', banner: null }

    const response = await apiClient.get(`/admin/banners/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.banner) {
      return {
        success: false,
        message: response.message || 'Banner not found',
        banner: null,
      }
    }

    return {
      success: true,
      banner: normalizeBanner(response.data.banner),
    }
  },

  /**
   * Create new banner in MongoDB
   * POST /api/v1/admin/banners
   */
  async createBanner(payload) {
    const response = await apiClient.post('/admin/banners', payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to create banner',
        banner: null,
      }
    }

    const rawBanner = response.data?.banner || response.data
    return {
      success: true,
      message: response.message || 'Banner created successfully',
      banner: normalizeBanner(rawBanner),
    }
  },

  /**
   * Update existing banner by ID
   * PUT /api/v1/admin/banners/:id
   */
  async updateBanner(id, payload) {
    if (!id) return { success: false, message: 'Banner ID is required' }

    const response = await apiClient.put(`/admin/banners/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update banner',
        banner: null,
      }
    }

    const rawBanner = response.data?.banner || response.data
    return {
      success: true,
      message: response.message || 'Banner updated successfully',
      banner: normalizeBanner(rawBanner),
    }
  },

  /**
   * Soft-delete banner (sets isActive = false)
   * DELETE /api/v1/admin/banners/:id
   */
  async deleteBanner(id) {
    if (!id) return { success: false, message: 'Banner ID is required' }

    const response = await apiClient.delete(`/admin/banners/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete banner',
      }
    }

    return {
      success: true,
      message: response.message || 'Banner deleted successfully',
    }
  },
}

export default adminBannerService
