import apiClient from './apiClient'

/**
 * Domain Service for Admin Inventory Management Operations
 */
export const adminInventoryService = {
  /**
   * Fetch paginated inventory list with stock status filters & search
   * GET /api/v1/admin/inventory
   */
  async getAdminInventory(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/inventory${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch admin inventory',
        inventory: [],
        pagination: null,
      }
    }

    const rawInventory = response.data?.inventory || response.data || []
    return {
      success: true,
      inventory: Array.isArray(rawInventory) ? rawInventory : [],
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Get single product inventory details
   * GET /api/v1/admin/inventory/:productId
   */
  async getAdminInventoryById(productId) {
    if (!productId) return { success: false, message: 'Product ID is required', product: null }

    const response = await apiClient.get(`/admin/inventory/${encodeURIComponent(productId)}`)

    if (!response.success || !response.data?.product) {
      return {
        success: false,
        message: response.message || 'Product inventory details not found',
        product: null,
      }
    }

    return {
      success: true,
      product: response.data.product,
    }
  },

  /**
   * Adjust product stock (ADD, REMOVE, SET)
   * POST /api/v1/admin/inventory/:productId/adjust
   */
  async adjustStock(productId, payload) {
    if (!productId) return { success: false, message: 'Product ID is required' }

    const response = await apiClient.post(`/admin/inventory/${encodeURIComponent(productId)}/adjust`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Stock adjustment failed',
        data: null,
      }
    }

    return {
      success: true,
      message: response.message || 'Stock adjusted successfully',
      data: response.data,
    }
  },

  /**
   * Fetch stock adjustment transaction history logs for a product
   * GET /api/v1/admin/inventory/:productId/history
   */
  async getInventoryHistory(productId, params = {}) {
    if (!productId) return { success: false, message: 'Product ID is required', transactions: [] }

    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/inventory/${encodeURIComponent(productId)}/history${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch inventory history',
        transactions: [],
        pagination: null,
      }
    }

    const rawTransactions = response.data?.transactions || response.data || []
    return {
      success: true,
      transactions: Array.isArray(rawTransactions) ? rawTransactions : [],
      pagination: response.data?.pagination || null,
    }
  },
}

export default adminInventoryService
