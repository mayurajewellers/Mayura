import apiClient from './apiClient'
import { normalizeCollection } from './collectionService'

/**
 * Domain Service for Admin Collection CRUD Operations (Phase B-04 Backend)
 */
export const adminCollectionService = {
  /**
   * Fetch paginated list of collections (active & inactive) for admin management
   * GET /api/v1/admin/collections
   */
  async getAdminCollections(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/collections${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch admin collections',
        collections: [],
        pagination: null,
      }
    }

    const rawCollections = response.data?.collections || response.data || []
    const collections = Array.isArray(rawCollections)
      ? rawCollections.map(normalizeCollection).filter(Boolean)
      : []

    return {
      success: true,
      collections,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Fetch single collection by ID for admin edit form
   * GET /api/v1/admin/collections/:id
   */
  async getAdminCollectionById(id) {
    if (!id) return { success: false, message: 'Collection ID is required', collection: null }

    const response = await apiClient.get(`/admin/collections/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.collection) {
      return {
        success: false,
        message: response.message || 'Collection not found',
        collection: null,
      }
    }

    return {
      success: true,
      collection: normalizeCollection(response.data.collection),
    }
  },

  /**
   * Create new collection in MongoDB
   * POST /api/v1/admin/collections
   */
  async createCollection(payload) {
    const response = await apiClient.post('/admin/collections', payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to create collection',
        collection: null,
      }
    }

    const rawCollection = response.data?.collection || response.data
    return {
      success: true,
      message: response.message || 'Collection created successfully',
      collection: normalizeCollection(rawCollection),
    }
  },

  /**
   * Update existing collection by ID
   * PUT /api/v1/admin/collections/:id
   */
  async updateCollection(id, payload) {
    if (!id) return { success: false, message: 'Collection ID is required' }

    const response = await apiClient.put(`/admin/collections/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update collection',
        collection: null,
      }
    }

    const rawCollection = response.data?.collection || response.data
    return {
      success: true,
      message: response.message || 'Collection updated successfully',
      collection: normalizeCollection(rawCollection),
    }
  },

  /**
   * Soft-delete collection (sets isActive = false)
   * DELETE /api/v1/admin/collections/:id
   */
  async deleteCollection(id) {
    if (!id) return { success: false, message: 'Collection ID is required' }

    const response = await apiClient.delete(`/admin/collections/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete collection',
      }
    }

    return {
      success: true,
      message: response.message || 'Collection deleted successfully',
    }
  },
}

export default adminCollectionService
