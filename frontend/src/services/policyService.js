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
}

export default policyService
