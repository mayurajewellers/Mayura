import apiClient from './apiClient'

/**
 * Normalizes blog post payload from backend API
 */
export const normalizeBlogPost = (post) => {
  if (!post || typeof post !== 'object') return null

  return {
    ...post,
    id: post.slug || post._id || post.legacyId,
    _id: post._id || post.slug,
    slug: post.slug || '',
    title: post.title || '',
    category: post.category || 'Buying Guides',
    excerpt: post.excerpt || '',
    readMinutes: typeof post.readMinutes === 'number' ? post.readMinutes : 5,
    date: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : '2026-07-04',
    author: post.author || 'Mayura Jewellers',
    image: post.coverImage || post.image || '/images/editorial/studs-gold-rosette.jpg',
    image2: post.secondaryImage || post.image2 || null,
    featured: Boolean(post.isFeatured),
    body: Array.isArray(post.content) ? post.content : Array.isArray(post.body) ? post.body : [],
  }
}

/**
 * Domain Service for Blog / Journal CMS
 */
export const blogService = {
  /**
   * Fetch paginated published blog posts
   */
  async getBlogPosts(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/blog${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        posts: [],
        pagination: null,
      }
    }

    const rawPosts = response.data?.posts || response.data || []
    const posts = Array.isArray(rawPosts) ? rawPosts.map(normalizeBlogPost).filter(Boolean) : []

    return {
      success: true,
      posts,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Fetch single published blog post by slug
   */
  async getBlogPostBySlug(slug) {
    if (!slug) return { success: false, message: 'Slug is required', post: null, relatedPosts: [] }

    const response = await apiClient.get(`/blog/${encodeURIComponent(slug)}`)

    if (!response.success || !response.data?.post) {
      return {
        success: false,
        message: response.message || 'Blog post not found',
        post: null,
        relatedPosts: [],
      }
    }

    const post = normalizeBlogPost(response.data.post)
    const rawRelated = response.data?.relatedPosts || []
    const relatedPosts = Array.isArray(rawRelated)
      ? rawRelated.map(normalizeBlogPost).filter(Boolean)
      : []

    return {
      success: true,
      post,
      relatedPosts,
    }
  },
}

export default blogService
