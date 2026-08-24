import apiClient from './apiClient'

/**
 * Normalizes FAQ payload from backend API
 */
export const normalizeFaq = (item) => {
  if (!item || typeof item !== 'object') return null

  return {
    ...item,
    id: item._id || item.id,
    q: item.question || item.q || '',
    a: item.answer || item.a || '',
    category: item.category || 'General Merchandise',
    categoryId: item.categoryId || (item.category ? item.category.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'general'),
  }
}

/**
 * Domain Service for FAQ CMS
 */
export const faqService = {
  /**
   * Fetch active FAQs and organize into categories
   */
  async getFaqs(params = {}) {
    const query = new URLSearchParams()
    if (params.category) query.append('category', params.category)
    if (params.categoryId) query.append('categoryId', params.categoryId)

    const queryString = query.toString()
    const endpoint = `/faqs${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        faqs: [],
        categories: [],
      }
    }

    const rawItems = response.data?.faqs || response.data || []
    const faqs = Array.isArray(rawItems) ? rawItems.map(normalizeFaq).filter(Boolean) : []

    // Group FAQs by category for existing FaqPage accordion UI
    const categoryMap = {}
    faqs.forEach((faq) => {
      const catId = faq.categoryId || 'general'
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          title: faq.category || 'General Merchandise',
          blurb: 'Purity, hallmarking, weights and what is actually in the box.',
          items: [],
        }
      }
      categoryMap[catId].items.push({ q: faq.q, a: faq.a })
    })

    const categories = Object.values(categoryMap)

    return {
      success: true,
      faqs,
      categories,
    }
  },

  /**
   * Admin: Get all FAQs (GET /api/v1/admin/faqs)
   */
  async getAdminFaqs(params = {}) {
    const response = await apiClient.get('/admin/faqs', { params })
    if (!response.success) return { success: false, message: response.message, data: null }
    return { success: true, data: response.data }
  },

  /**
   * Admin: Create FAQ (POST /api/v1/admin/faqs)
   */
  async createFaq(payload) {
    const response = await apiClient.post('/admin/faqs', payload)
    if (!response.success) return { success: false, message: response.message }
    return { success: true, message: response.message, data: response.data }
  },

  /**
   * Admin: Update FAQ (PUT /api/v1/admin/faqs/:id)
   */
  async updateFaq(id, payload) {
    const response = await apiClient.put(`/admin/faqs/${encodeURIComponent(id)}`, payload)
    if (!response.success) return { success: false, message: response.message }
    return { success: true, message: response.message, data: response.data }
  },

  /**
   * Admin: Soft-delete FAQ (DELETE /api/v1/admin/faqs/:id)
   */
  async deleteFaq(id) {
    const response = await apiClient.delete(`/admin/faqs/${encodeURIComponent(id)}`)
    if (!response.success) return { success: false, message: response.message }
    return { success: true, message: response.message }
  },
}

export default faqService
