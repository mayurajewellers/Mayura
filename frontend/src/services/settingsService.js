import apiClient from './apiClient'

/**
 * Domain Service for Site Settings
 */
export const settingsService = {
  /**
   * Fetch public site settings from GET /api/v1/settings
   */
  async getSettings() {
    const response = await apiClient.get('/settings')

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        settings: null,
      }
    }

    const settings = response.data?.settings || response.data || null

    return {
      success: true,
      settings,
    }
  },
}

export default settingsService
