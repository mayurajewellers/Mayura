import apiClient from './apiClient'

/**
 * Normalizes testimonial payload from backend API
 */
export const normalizeTestimonial = (item) => {
  if (!item || typeof item !== 'object') return null

  return {
    ...item,
    id: item._id || item.id || `t-${Math.random()}`,
    _id: item._id || item.id,
    name: item.name || 'Customer',
    location: item.location || 'Mumbai',
    rating: typeof item.rating === 'number' ? item.rating : 5,
    date: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '2026-06-14',
    verified: item.isVerified !== undefined ? Boolean(item.isVerified) : true,
    purchase: item.purchase || 'Fine Jewellery',
    headline: item.headline || item.title || '',
    quote: item.quote || item.content || '',
    isFeatured: Boolean(item.isFeatured),
  }
}

/**
 * Domain Service for Testimonials CMS
 */
export const testimonialService = {
  /**
   * Fetch active customer testimonials
   */
  async getTestimonials() {
    const response = await apiClient.get('/testimonials')

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        testimonials: [],
        averageRating: '5.0',
        ratingDistribution: [],
      }
    }

    const rawItems = response.data?.testimonials || response.data || []
    const testimonials = Array.isArray(rawItems)
      ? rawItems.map(normalizeTestimonial).filter(Boolean)
      : []

    // Calculate rating stats dynamically
    const total = testimonials.length || 1
    const sum = testimonials.reduce((acc, t) => acc + (t.rating || 5), 0)
    const averageRating = (sum / total).toFixed(1)

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    testimonials.forEach((t) => {
      const star = Math.min(5, Math.max(1, Math.round(t.rating || 5)))
      counts[star] = (counts[star] || 0) + 1
    })

    const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: counts[stars],
      percent: Math.round((counts[stars] / total) * 100),
    }))

    return {
      success: true,
      testimonials,
      averageRating,
      ratingDistribution,
    }
  },

  /**
   * Admin: Get all testimonials (GET /api/v1/admin/testimonials)
   */
  async getAdminTestimonials(params = {}) {
    const response = await apiClient.get('/admin/testimonials', { params })
    if (!response.success) return { success: false, message: response.message, data: null }
    return { success: true, data: response.data }
  },

  /**
   * Admin: Create testimonial (POST /api/v1/admin/testimonials)
   */
  async createTestimonial(payload) {
    const response = await apiClient.post('/admin/testimonials', payload)
    if (!response.success) return { success: false, message: response.message }
    return { success: true, message: response.message, data: response.data }
  },

  /**
   * Admin: Update testimonial (PUT /api/v1/admin/testimonials/:id)
   */
  async updateTestimonial(id, payload) {
    const response = await apiClient.put(`/admin/testimonials/${encodeURIComponent(id)}`, payload)
    if (!response.success) return { success: false, message: response.message }
    return { success: true, message: response.message, data: response.data }
  },

  /**
   * Admin: Soft-delete testimonial (DELETE /api/v1/admin/testimonials/:id)
   */
  async deleteTestimonial(id) {
    const response = await apiClient.delete(`/admin/testimonials/${encodeURIComponent(id)}`)
    if (!response.success) return { success: false, message: response.message }
    return { success: true, message: response.message }
  },
}

export default testimonialService
