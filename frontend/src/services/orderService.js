import apiClient from './apiClient'

/**
 * Normalizes order payload from backend API
 */
export const normalizeOrder = (order) => {
  if (!order || typeof order !== 'object') return null

  return {
    ...order,
    id: order._id || order.orderNumber,
    _id: order._id || order.orderNumber,
    orderNumber: order.orderNumber || 'MJ-ORDER',
    status: order.status || 'PENDING_PAYMENT',
    date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    createdAt: order.createdAt || new Date().toISOString(),
    customer: order.customer || { name: '', email: '', phone: '' },
    shippingAddress: order.shippingAddress || {},
    billingAddress: order.billingAddress || order.shippingAddress || {},
    items: Array.isArray(order.items) ? order.items : [],
    pricing: order.pricing || {
      subtotal: 0,
      discount: 0,
      tax: 0,
      shipping: 0,
      grandTotal: 0,
    },
    payment: order.payment || {
      method: 'COD',
      status: 'PENDING',
    },
    delivery: order.delivery || {
      method: 'standard',
      estimatedDelivery: null,
      trackingNumber: '',
      courierName: '',
    },
    adminNotes: order.adminNotes || '',
  }
}

/**
 * Domain Service for Customer & Admin Orders
 */
export const orderService = {
  /**
   * Create new customer order (requires authentication)
   */
  async createOrder(payload) {
    const response = await apiClient.post('/orders', payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Order creation failed',
        order: null,
        razorpay: null,
      }
    }

    const rawOrder = response.data?.order || response.data
    const order = normalizeOrder(rawOrder)
    const razorpay = response.data?.razorpay || null

    return {
      success: true,
      message: response.message || 'Order created successfully',
      order,
      razorpay,
    }
  },

  /**
   * Get current customer's order history
   */
  async getMyOrders(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        orders: [],
        pagination: null,
      }
    }

    const rawOrders = response.data?.orders || response.data || []
    const orders = Array.isArray(rawOrders) ? rawOrders.map(normalizeOrder).filter(Boolean) : []

    return {
      success: true,
      orders,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Get single order by ID or orderNumber (Public / Customer)
   */
  async getOrderById(id) {
    if (!id) return { success: false, message: 'Order ID is required', order: null }

    const response = await apiClient.get(`/orders/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Order not found',
        order: null,
      }
    }

    const rawOrder = response.data?.order || response.data
    const order = normalizeOrder(rawOrder)

    return {
      success: true,
      order,
    }
  },

  /**
   * Admin: Get all orders with search, filters & pagination
   * GET /api/v1/admin/orders
   */
  async getAdminOrders(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch admin orders',
        orders: [],
        pagination: null,
      }
    }

    const rawOrders = response.data?.orders || response.data || []
    const orders = Array.isArray(rawOrders) ? rawOrders.map(normalizeOrder).filter(Boolean) : []

    return {
      success: true,
      orders,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Admin: Get order details by ID or orderNumber
   * GET /api/v1/admin/orders/:id
   */
  async getAdminOrderById(id) {
    if (!id) return { success: false, message: 'Order ID is required', order: null }

    const response = await apiClient.get(`/admin/orders/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.order) {
      return {
        success: false,
        message: response.message || 'Order not found',
        order: null,
      }
    }

    return {
      success: true,
      order: normalizeOrder(response.data.order),
    }
  },

  /**
   * Admin: Update order status, payment status, tracking, or notes
   * PUT /api/v1/admin/orders/:id
   */
  async updateAdminOrder(id, payload) {
    if (!id) return { success: false, message: 'Order ID is required' }

    const response = await apiClient.put(`/admin/orders/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update order',
        order: null,
      }
    }

    const rawOrder = response.data?.order || response.data
    return {
      success: true,
      message: response.message || 'Order updated successfully',
      order: normalizeOrder(rawOrder),
    }
  },
}

export default orderService
