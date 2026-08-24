import apiClient from './apiClient'

/**
 * Normalizes gallery item payload from backend API
 */
export const normalizeGalleryItem = (item) => {
  if (!item || typeof item !== 'object') return null

  return {
    ...item,
    id: item._id || item.src,
    src: item.image || item.src || '/images/editorial/bride-gujarati.jpg',
    alt: item.alt || item.caption || 'Mayura Jewellers Gallery',
    caption: item.caption || item.title || '',
    span: item.span || 'normal',
    group: item.group || item.category || 'Bridal',
  }
}

/**
 * Domain Service for Gallery CMS
 */
export const galleryService = {
  /**
   * Fetch active gallery items with optional group filter
   */
  async getGallery(params = {}) {
    const query = new URLSearchParams()
    if (params.group && params.group !== 'All') {
      query.append('group', params.group)
    }

    const queryString = query.toString()
    const endpoint = `/gallery${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        items: [],
      }
    }

    const rawItems = response.data?.items || response.data || []
    const items = Array.isArray(rawItems)
      ? rawItems.map(normalizeGalleryItem).filter(Boolean)
      : []

    return {
      success: true,
      items,
    }
  },
}

export default galleryService
