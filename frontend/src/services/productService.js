import apiClient from './apiClient'

/**
 * Normalizes backend product model payload for 100% compatibility
 * with existing frontend components and localStorage data structures.
 */
export const normalizeProduct = (product) => {
  if (!product || typeof product !== 'object') return null

  // Preserve legacy ID compatibility (e.g. 'mj-001') for cart/wishlist
  const id = product.legacyId || product.id || product._id

  return {
    ...product,
    id,
    _id: product._id || id,
    legacyId: product.legacyId || id,
    sku: product.sku || '',
    slug: product.slug || '',
    name: product.name || '',
    type: product.type || product.category || 'Jewellery',
    collection: product.collection || 'all',
    departments: Array.isArray(product.departments) ? product.departments : [],
    audience: product.audience || 'Women',
    price: typeof product.price === 'number' ? product.price : 0,
    compareAtPrice: typeof product.compareAtPrice === 'number' ? product.compareAtPrice : null,
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/images/products/placeholder.jpg'],
    badge: product.badge || null,
    metal: product.metal || '22K Gold',
    metalKey: product.metalKey || 'gold-22k',
    purity: product.purity || '22K Gold',
    grossWeight: product.grossWeight || 0,
    netWeight: product.netWeight || 0,
    makingCharges: product.makingCharges || '',
    stones: Array.isArray(product.stones) ? product.stones : [],
    size: product.size || null,
    occasions: Array.isArray(product.occasions) ? product.occasions : [],
    rating: typeof product.rating === 'number' ? product.rating : 4.8,
    reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : 12,
    madeToOrder: Boolean(product.madeToOrder),
    inStock: product.inStock !== undefined ? Boolean(product.inStock) : true,
    shipping: product.shipping || 'Insured delivery across India',
    returns: product.returns || '15-day return policy',
    warranty: product.warranty || 'Lifetime guarantee',
    certification: product.certification || 'BIS Hallmarked',
    care: Array.isArray(product.care) ? product.care : [],
    description: product.description || '',
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    goldOptions: product.goldOptions || null,
    priceBreakup: product.priceBreakup || null,
    styleTags: Array.isArray(product.styleTags) ? product.styleTags : [],
  }
}

/**
 * Domain Service for Products
 */
export const productService = {
  /**
   * Fetch list of products with optional server filters & sorting
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) query.append(key, value.join(','))
        } else {
          query.append(key, String(value))
        }
      }
    })

    const queryString = query.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        products: [],
        pagination: null,
      }
    }

    const rawProducts = response.data?.products || response.data || []
    const products = Array.isArray(rawProducts)
      ? rawProducts.map(normalizeProduct).filter(Boolean)
      : []

    return {
      success: true,
      products,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Fetch single product by slug
   */
  async getProductBySlug(slug) {
    if (!slug) return { success: false, message: 'Slug is required', product: null }

    const response = await apiClient.get(`/products/${encodeURIComponent(slug)}`)

    if (!response.success || !response.data?.product) {
      return {
        success: false,
        message: response.message || 'Product not found',
        product: null,
      }
    }

    return {
      success: true,
      product: normalizeProduct(response.data.product),
    }
  },

  /**
   * Fetch single product by ID / legacyId
   */
  async getProductById(id) {
    if (!id) return { success: false, message: 'ID is required', product: null }

    const response = await apiClient.get(`/products/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.product) {
      return {
        success: false,
        message: response.message || 'Product not found',
        product: null,
      }
    }

    return {
      success: true,
      product: normalizeProduct(response.data.product),
    }
  },

  /**
   * Fetch featured products for rail display
   */
  async getFeaturedProducts(limit = 8) {
    return this.getProducts({ isFeatured: true, limit })
  },
}

export default productService
