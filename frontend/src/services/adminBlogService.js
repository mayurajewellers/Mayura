import apiClient from './apiClient'
import { normalizeBlogPost } from './blogService'

/**
 * Domain Service for Admin Blog Operations (Phase B-07 Backend)
 */
export const adminBlogService = {
  /**
   * Fetch paginated list of blog posts (published, draft, archived, active & inactive)
   * GET /api/v1/admin/blog
   */
  async getAdminBlogPosts(params = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const queryString = query.toString()
    const endpoint = `/admin/blog${queryString ? `?${queryString}` : ''}`
    const response = await apiClient.get(endpoint)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Could not fetch admin blog posts',
        posts: [],
        pagination: null,
      }
    }

    const rawPosts = response.data?.posts || response.data || []
    const posts = Array.isArray(rawPosts)
      ? rawPosts.map(normalizeBlogPost).filter(Boolean)
      : []

    return {
      success: true,
      posts,
      pagination: response.data?.pagination || null,
    }
  },

  /**
   * Fetch single blog post by ID, legacyId, or slug for admin edit form
   * GET /api/v1/admin/blog/:id
   */
  async getAdminBlogPostById(id) {
    if (!id) return { success: false, message: 'Blog post ID is required', post: null }

    const response = await apiClient.get(`/admin/blog/${encodeURIComponent(id)}`)

    if (!response.success || !response.data?.post) {
      return {
        success: false,
        message: response.message || 'Blog post not found',
        post: null,
      }
    }

    return {
      success: true,
      post: normalizeBlogPost(response.data.post),
    }
  },

  /**
   * Create new blog post in MongoDB
   * POST /api/v1/admin/blog
   */
  async createBlogPost(payload) {
    const response = await apiClient.post('/admin/blog', payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to create blog post',
        post: null,
      }
    }

    const rawPost = response.data?.post || response.data
    return {
      success: true,
      message: response.message || 'Blog post created successfully',
      post: normalizeBlogPost(rawPost),
    }
  },

  /**
   * Update existing blog post by ID
   * PUT /api/v1/admin/blog/:id
   */
  async updateBlogPost(id, payload) {
    if (!id) return { success: false, message: 'Blog post ID is required' }

    const response = await apiClient.put(`/admin/blog/${encodeURIComponent(id)}`, payload)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update blog post',
        post: null,
      }
    }

    const rawPost = response.data?.post || response.data
    return {
      success: true,
      message: response.message || 'Blog post updated successfully',
      post: normalizeBlogPost(rawPost),
    }
  },

  /**
   * Soft-delete blog post (sets status = 'ARCHIVED' or isActive = false)
   * DELETE /api/v1/admin/blog/:id
   */
  async deleteBlogPost(id) {
    if (!id) return { success: false, message: 'Blog post ID is required' }

    const response = await apiClient.delete(`/admin/blog/${encodeURIComponent(id)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Failed to delete blog post',
      }
    }

    return {
      success: true,
      message: response.message || 'Blog post archived successfully',
    }
  },
}

export default adminBlogService
