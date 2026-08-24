import apiClient from './apiClient'

/**
 * Normalizes policy object from backend API
 */
export const normalizePolicy = (policy) => {
  if (!policy || typeof policy !== 'object') return null

  return {
    ...policy,
    id: policy.slug || policy._id,
    slug: policy.slug || '',
    title: policy.title || '',
    kicker: policy.kicker || 'Policy',
    intro: policy.intro || policy.summary || '',
    updated: policy.updatedAt ? new Date(policy.updatedAt).toISOString().split('T')[0] : '2026-07-01',
    variant: policy.variant || 'clauses',
    sections: Array.isArray(policy.sections) ? policy.sections : [],
  }
}

/**
 * Domain Service for Policies
 */
export const policyService = {
  /**
   * Fetch active policies list from GET /api/v1/policies
   */
  async getPolicies() {
    const response = await apiClient.get('/policies')

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        policies: [],
      }
    }

    const rawPolicies = response.data?.policies || response.data || []
    const policies = Array.isArray(rawPolicies) ? rawPolicies.map(normalizePolicy).filter(Boolean) : []

    return {
      success: true,
      policies,
    }
  },

  /**
   * Fetch single active policy by slug from GET /api/v1/policies/:slug
   */
  async getPolicyBySlug(slug) {
    if (!slug) return { success: false, message: 'Policy slug is required', policy: null }

    const response = await apiClient.get(`/policies/${encodeURIComponent(slug)}`)

    if (!response.success) {
      return {
        success: false,
        message: response.message || 'Policy not found',
        policy: null,
      }
    }

    const rawPolicy = response.data?.policy || response.data
    const policy = normalizePolicy(rawPolicy)

    return {
      success: true,
      policy,
    }
  },

  /**
   * Fetch admin policies from GET /api/v1/admin/policies
   */
  async getAdminPolicies(params = {}) {
    const response = await apiClient.get('/admin/policies', { params })
    if (!response.success) {
      return { success: false, message: response.message, data: null }
    }
    return { success: true, data: response.data }
  },

  /**
   * Create new policy via POST /api/v1/admin/policies
   */
  async createPolicy(payload) {
    const response = await apiClient.post('/admin/policies', payload)
    if (!response.success) {
      return { success: false, message: response.message }
    }
    return { success: true, message: response.message, data: response.data }
  },

  /**
   * Update existing policy via PUT /api/v1/admin/policies/:id
   */
  async updatePolicy(id, payload) {
    const response = await apiClient.put(`/admin/policies/${encodeURIComponent(id)}`, payload)
    if (!response.success) {
      return { success: false, message: response.message }
    }
    return { success: true, message: response.message, data: response.data }
  },

  /**
   * Soft-delete policy via DELETE /api/v1/admin/policies/:id
   */
  async deletePolicy(id) {
    const response = await apiClient.delete(`/admin/policies/${encodeURIComponent(id)}`)
    if (!response.success) {
      return { success: false, message: response.message }
    }
    return { success: true, message: response.message }
  },
}

export default policyService
