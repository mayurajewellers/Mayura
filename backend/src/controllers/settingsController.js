import SiteSettings from '../models/SiteSettings.js'

const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return true
  const trimmed = url.trim().toLowerCase()
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('data:text/html')
  ) {
    return false
  }
  return true
}

/**
 * Public: Get site settings singleton
 * GET /api/v1/settings
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'main' }).lean()

    if (!settings) {
      settings = await SiteSettings.create({ key: 'main' })
    }

    return res.status(200).json({
      success: true,
      message: 'Site settings fetched successfully',
      data: { settings },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get site settings
 * GET /api/v1/admin/settings
 */
export const getAdminSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'main' }).lean()

    if (!settings) {
      settings = await SiteSettings.create({ key: 'main' })
    }

    return res.status(200).json({
      success: true,
      message: 'Admin site settings fetched successfully',
      data: { settings },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update site settings singleton
 * PUT /api/v1/admin/settings
 */
export const updateAdminSettings = async (req, res, next) => {
  try {
    const updateData = { ...req.body }
    delete updateData._id
    delete updateData.key

    // Validate social link URLs
    if (Array.isArray(updateData.socialLinks)) {
      for (const link of updateData.socialLinks) {
        if (link.href && !isSafeUrl(link.href)) {
          return res.status(400).json({
            success: false,
            message: `Unsafe social link URL detected for '${link.label}'.`,
          })
        }
      }
    }

    let settings = await SiteSettings.findOne({ key: 'main' })
    if (!settings) {
      settings = new SiteSettings({ key: 'main' })
    }

    Object.assign(settings, updateData)
    await settings.save()

    return res.status(200).json({
      success: true,
      message: 'Site settings updated successfully',
      data: { settings },
    })
  } catch (error) {
    next(error)
  }
}
