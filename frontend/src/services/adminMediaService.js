import apiClient, { getApiBaseUrl, getAuthToken } from './apiClient'

/**
 * Normalizes backend media record payload
 */
export const normalizeMedia = (item) => {
  if (!item || typeof item !== 'object') return null
  return {
    ...item,
    id: item._id || item.publicId,
    publicId: item.publicId || '',
    name: item.name || '',
    url: item.url || '',
    provider: item.provider || 'local',
    resourceType: item.resourceType || 'image',
    folder: item.folder || 'general',
    isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
  }
}

/**
 * Domain Service for Admin Media Operations (Phase B-06 Backend)
 */
export const adminMediaService = {
  /**
   * Upload device file to Cloudinary / backend storage
   * POST /api/v1/admin/media/upload
   */
  async uploadMedia(file, folder = 'mayura/uploads', altText = '') {
    if (!file) return { success: false, message: 'No file selected for upload.' }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    if (altText) formData.append('altText', altText)

    const token = getAuthToken()
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`

    try {
      const uploadUrl = `${getApiBaseUrl()}/admin/media/upload`
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'File upload failed.',
          media: null,
        }
      }

      const rawMedia = data.data?.media || data.data
      return {
        success: true,
        message: data.message || 'Media uploaded successfully.',
        media: normalizeMedia(rawMedia),
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Network error during upload.',
        media: null,
      }
    }
  },

  /**
   * Fetch paginated media records for admin management
   * GET /api/v1/admin/media
   */
  async getAdminMedia(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/media${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch admin media',
        media: [],
        pagination: null,
      }
    }

    const rawMedia = response.data?.media || response.data || []
    const media = Array.isArray(rawMedia)
      ? rawMedia.map(normalizeMedia).filter(Boolean)
      : []

    return {
      success: true,
      media,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Fetch single media record by ID or publicId
   * GET /api/v1/admin/media/:id
   */
  async getAdminMediaById(id) {
    if (!id) return { success: false, message: 'Media ID is required', media: null }

    const response = await apiClient.get(`/admin/media/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.media) {
      return {
        success: false,
        message: response.message || 'Media not found',
        media: null,
      }
    }

    return {
      success: true,
      media: normalizeMedia(response.data.media),
    }
  },

  /**
   * Create / register media record in MongoDB
   * POST /api/v1/admin/media
   */
  async createMedia(payload) {
    const response = await apiClient.post('/admin/media', payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to create media record',
        media: null,
      }
    }

    const rawMedia = response.data?.media || response.data
    return {
      success: true,
      message: response.message || 'Media record created successfully',
      media: normalizeMedia(rawMedia),
    }
  },

  /**
   * Update existing media metadata by ID
   * PUT /api/v1/admin/media/:id
   */
  async updateMedia(id, payload) {
    if (!id) return { success: false, message: 'Media ID is required' }

    const response = await apiClient.put(`/admin/media/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update media record',
        media: null,
      }
    }

    const rawMedia = response.data?.media || response.data
    return {
      success: true,
      message: response.message || 'Media record updated successfully',
      media: normalizeMedia(rawMedia),
    }
  },

  /**
   * Delete media record (soft delete by default, or permanent hard delete)
   * DELETE /api/v1/admin/media/:id
   */
  async deleteMedia(id, hard = false) {
    if (!id) return { success: false, message: 'Media ID is required' }

    const endpoint = `/admin/media/${encodeURIComponent(id)}${hard ? '?hard=true' : ''}`
    const response = await apiClient.delete(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete media record',
      }
    }

    return {
      success: true,
      message: response.message || 'Media record deleted successfully',
    }
  },
}

export default adminMediaService
