import apiClient from './apiClient'

/**
 * Normalizes section payload from backend homepage API
 */
export const normalizeSection = (section) => {
  if (!section || typeof section !== 'object') return null

  return {
    ...section,
    id: section._id || section.key,
    key: section.key || '',
    type: section.type || 'custom',
    title: section.title || '',
    subtitle: section.subtitle || '',
    content: section.content || {},
    items: Array.isArray(section.items) ? section.items : [],
    displayOrder: typeof section.displayOrder === 'number' ? section.displayOrder : 0,
    isActive: section.isActive !== undefined ? Boolean(section.isActive) : true,
  }
}

/**
 * Domain Service for Homepage CMS
 */
export const homepageService = {
  /**
   * Fetch active homepage sections
   */
  async getHomepage() {
    const response = await apiClient.get('/homepage')

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        sections: [],
        sectionsByKey: {},
      }
    }

    const rawSections = response.data?.sections || response.data || []
    const sections = Array.isArray(rawSections)
      ? rawSections.map(normalizeSection).filter(Boolean)
      : []

    // Build key-indexed lookup map for quick section access
    const sectionsByKey = {}
    sections.forEach((sec) => {
      if (sec.key) sectionsByKey[sec.key] = sec
    })

    return {
      success: true,
      sections,
      sectionsByKey,
    }
  },
}

export default homepageService
