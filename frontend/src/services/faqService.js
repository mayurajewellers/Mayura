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
}

export default faqService
