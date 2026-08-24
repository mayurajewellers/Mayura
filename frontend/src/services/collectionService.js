import apiClient from './apiClient'

/**
 * Normalizes backend collection payload
 */
export const normalizeCollection = (collection) => {
  if (!collection || typeof collection !== 'object') return null

  return {
    ...collection,
    id: collection._id || collection.slug,
    slug: collection.slug || '',
    name: collection.name || '',
    kicker: collection.kicker || 'Signature Collection',
    tagline: collection.tagline || '',
    meaning: collection.meaning || '',
    intro: collection.intro || collection.description || '',
    story: collection.story || '',
    heroImage: collection.heroImage || collection.coverImage || '/images/editorial/layered-haram-trunk.jpg',
    coverImage: collection.coverImage || collection.heroImage || '/images/editorial/layered-haram-trunk.jpg',
    detailImage: collection.detailImage || collection.heroImage || '/images/editorial/layered-haram-trunk.jpg',
    isActive: collection.isActive !== undefined ? Boolean(collection.isActive) : true,
  }
}

/**
 * Domain Service for Collections
 */
export const collectionService = {
  /**
   * Fetch all active collections
   */
  async getCollections(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/collections${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        collections: [],
      }
    }

    const rawCollections = response.data?.collections || response.data || []
    const collections = Array.isArray(rawCollections)
      ? rawCollections.map(normalizeCollection).filter(Boolean)
      : []

    return {
      success: true,
      collections,
    }
  },

  /**
   * Fetch single collection by slug
   */
  async getCollectionBySlug(slug) {
    if (!slug) return { success: false, message: 'Slug is required', collection: null }

    const response = await apiClient.get(`/collections/${encodeURIComponent(slug)}`)

    if (!response.success || !response.data?.collection) {
      return {
        success: false,
        message: response.message || 'Collection not found',
        collection: null,
      }
    }

    return {
      success: true,
      collection: normalizeCollection(response.data.collection),
    }
  },
}

export default collectionService
