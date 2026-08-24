import apiClient from './apiClient'

/**
 * Normalizes banner payload from backend banner API
 */
export const normalizeBanner = (banner) => {
  if (!banner || typeof banner !== 'object') return null

  return {
    ...banner,
    id: banner.slug || banner._id,
    _id: banner._id || banner.slug,
    title: banner.title || '',
    titleAccent: banner.titleAccent || banner.subtitle || '',
    eyebrow: banner.eyebrow || '',
    copy: banner.copy || banner.description || '',
    desktopImage: banner.desktopImage || banner.image || '/images/hero/mayura-hero-01.jpg',
    mobileImage: banner.mobileImage || banner.desktopImage || banner.image || '/images/hero/mayura-hero-01.jpg',
    imagePosition: banner.imagePosition || 'center',
    panel: banner.panel || 'bg-espresso text-ivory',
    tone: banner.tone || 'light',
    cta: banner.cta || { label: 'Explore Collection', to: '/collections/all' },
    secondary: banner.secondary || banner.secondaryCta || { label: 'Learn More', to: '/contact' },
    placement: banner.placement || 'homepage-hero',
    displayOrder: typeof banner.displayOrder === 'number' ? banner.displayOrder : 0,
    isActive: banner.isActive !== undefined ? Boolean(banner.isActive) : true,
  }
}

/**
 * Domain Service for Banners CMS
 */
export const bannerService = {
  /**
   * Fetch active & valid banners for a given placement
   */
  async getBanners(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/banners${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        banners: [],
      }
    }

    const rawBanners = response.data?.banners || response.data || []
    const banners = Array.isArray(rawBanners)
      ? rawBanners.map(normalizeBanner).filter(Boolean)
      : []

    return {
      success: true,
      banners,
    }
  },

  /**
   * Fetch single banner by slug
   */
  async getBannerBySlug(slug) {
    if (!slug) return { success: false, message: 'Slug is required', banner: null }

    const response = await apiClient.get(`/banners/${encodeURIComponent(slug)}`)

    if (!response.success || !response.data?.banner) {
      return {
        success: false,
        message: response.message || 'Banner not found',
        banner: null,
      }
    }

    return {
      success: true,
      banner: normalizeBanner(response.data.banner),
    }
  },
}

export default bannerService
