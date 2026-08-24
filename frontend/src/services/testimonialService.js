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
}

export default testimonialService
