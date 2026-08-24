import apiClient from './apiClient'
import { normalizeProduct } from './productService'

/**
 * Domain Service for Admin Product CRUD Operations (Phase B-03 Backend)
 */
export const adminProductService = {
  /**
   * Fetch paginated list of products (active & inactive) for admin management
   * GET /api/v1/admin/products
   */
  async getAdminProducts(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/products${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch admin products',
        products: [],
        pagination: null,
      }
    }

    const rawProducts = response.data?.products || response.data || []
    const products = Array.isArray(rawProducts)
      ? rawProducts.map(normalizeProduct).filter(Boolean)
      : []

    return {
      success: true,
      products,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Fetch single product by ID for admin edit form
   * GET /api/v1/admin/products/:id
   */
  async getAdminProductById(id) {
    if (!id) return { success: false, message: 'Product ID is required', product: null }

    const response = await apiClient.get(`/admin/products/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.product) {
      return {
        success: false,
        message: response.message || 'Product not found',
        product: null,
      }
    }

    return {
      success: true,
      product: normalizeProduct(response.data.product),
    }
  },

  /**
   * Create new product in MongoDB
   * POST /api/v1/admin/products
   */
  async createProduct(payload) {
    const response = await apiClient.post('/admin/products', payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to create product',
        product: null,
      }
    }

    const rawProduct = response.data?.product || response.data
    return {
      success: true,
      message: response.message || 'Product created successfully',
      product: normalizeProduct(rawProduct),
    }
  },

  /**
   * Update existing product by ID
   * PUT /api/v1/admin/products/:id
   */
  async updateProduct(id, payload) {
    if (!id) return { success: false, message: 'Product ID is required' }

    const response = await apiClient.put(`/admin/products/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update product',
        product: null,
      }
    }

    const rawProduct = response.data?.product || response.data
    return {
      success: true,
      message: response.message || 'Product updated successfully',
      product: normalizeProduct(rawProduct),
    }
  },

  /**
   * Soft-delete product (sets isActive = false)
   * DELETE /api/v1/admin/products/:id
   */
  async deleteProduct(id) {
    if (!id) return { success: false, message: 'Product ID is required' }

    const response = await apiClient.delete(`/admin/products/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete product',
      }
    }

    return {
      success: true,
      message: response.message || 'Product deleted successfully',
    }
  },
}

export default adminProductService
