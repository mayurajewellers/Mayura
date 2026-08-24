import apiClient from './apiClient'

/**
 * Domain Service for Admin Dashboard Analytics (Phase B-13 Backend)
 */
export const dashboardService = {
  /**
   * High-level dashboard summary cards
   * GET /api/v1/admin/dashboard/overview
   */
  async getOverview() {
    const response = await apiClient.get('/admin/dashboard/overview')
    return response
  },

  /**
   * Recognized revenue metrics and daily time-series breakdown
   * GET /api/v1/admin/dashboard/revenue?range=7d|30d|90d|1y
   */
  async getRevenue(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v))
    })
    const queryString = query.toString()
    const endpoint = `/admin/dashboard/revenue${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)
    return response
  },

  /**
   * Order count, status breakdown, and payment status breakdown
   * GET /api/v1/admin/dashboard/orders
   */
  async getOrders(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v))
    })
    const queryString = query.toString()
    const endpoint = `/admin/dashboard/orders${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)
    return response
  },

  /**
   * Customer counts (strictly CUSTOMER role)
   * GET /api/v1/admin/dashboard/customers
   */
  async getCustomers(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v))
    })
    const queryString = query.toString()
    const endpoint = `/admin/dashboard/customers${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)
    return response
  },

  /**
   * Product analytics
   * GET /api/v1/admin/dashboard/products
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v))
    })
    const queryString = query.toString()
    const endpoint = `/admin/dashboard/products${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)
    return response
  },

  /**
   * Top selling products aggregated from order history
   * GET /api/v1/admin/dashboard/products/top
   */
  async getTopProducts(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v))
    })
    const queryString = query.toString()
    const endpoint = `/admin/dashboard/products/top${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)
    return response
  },

  /**
   * Combined recent activity feed (orders, enquiries, consultations, customers)
   * GET /api/v1/admin/dashboard/recent
   */
  async getRecent(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v))
    })
    const queryString = query.toString()
    const endpoint = `/admin/dashboard/recent${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)
    return response
  },
}

export default dashboardService
