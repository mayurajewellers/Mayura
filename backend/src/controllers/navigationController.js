import mongoose from 'mongoose'
import NavigationItem from '../models/NavigationItem.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

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

const ALLOWED_SECTIONS = ['category', 'service', 'footer']

/**
 * Public: Get active navigation items
 * GET /api/v1/navigation
 */
export const getNavigation = async (req, res, next) => {
  try {
    const { section } = req.query
    const query = { isActive: true }

    if (section && section.trim()) {
      if (ALLOWED_SECTIONS.includes(section.trim())) {
        query.section = section.trim()
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid section filter. Allowed values: ${ALLOWED_SECTIONS.join(', ')}`,
        })
      }
    }

    const items = await NavigationItem.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Navigation items fetched successfully',
      data: { items },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all navigation items (active & inactive)
 * GET /api/v1/admin/navigation
 */
export const getAdminNavigation = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { section, isActive, search } = req.query
    const query = {}

    if (section && section.trim()) {
      if (ALLOWED_SECTIONS.includes(section.trim())) {
        query.section = section.trim()
      }
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [{ label: searchRegex }, { to: searchRegex }]
    }

    const [items, total] = await Promise.all([
      NavigationItem.find(query).sort({ displayOrder: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
      NavigationItem.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin navigation items fetched successfully',
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Create navigation item
 * POST /api/v1/admin/navigation
 */
export const createNavigationItem = async (req, res, next) => {
  try {
    const data = { ...req.body }
    delete data._id

    if (!data.label || !data.to) {
      return res.status(400).json({
        success: false,
        message: 'Label and destination route/URL (to) are required fields.',
      })
    }

    if (!isSafeUrl(data.to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe destination URL provided.',
      })
    }

    if (data.section && !ALLOWED_SECTIONS.includes(data.section.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Allowed values: ${ALLOWED_SECTIONS.join(', ')}`,
      })
    }

    if (!data.legacyId) {
      data.legacyId = `nav-${Date.now()}`
    }

    const existing = await NavigationItem.findOne({ legacyId: data.legacyId })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Navigation item with legacyId '${data.legacyId}' already exists.`,
      })
    }

    const item = await NavigationItem.create(data)

    return res.status(201).json({
      success: true,
      message: 'Navigation item created successfully',
      data: { item },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate navigation item legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get navigation item by ID or legacyId
 * GET /api/v1/admin/navigation/:id
 */
export const getNavigationItemById = async (req, res, next) => {
  try {
    const { id } = req.params

    let item = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await NavigationItem.findById(id).lean()
    }
    if (!item) {
      item = await NavigationItem.findOne({ legacyId: id }).lean()
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navigation item not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Navigation item retrieved successfully',
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update navigation item
 * PUT /api/v1/admin/navigation/:id
 */
export const updateNavigationItem = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    delete updateData._id

    let item = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await NavigationItem.findById(id)
    }
    if (!item) {
      item = await NavigationItem.findOne({ legacyId: id })
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navigation item not found',
      })
    }

    if (updateData.to && !isSafeUrl(updateData.to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe destination URL provided.',
      })
    }

    if (updateData.section && !ALLOWED_SECTIONS.includes(updateData.section.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Allowed values: ${ALLOWED_SECTIONS.join(', ')}`,
      })
    }

    Object.assign(item, updateData)
    await item.save()

    return res.status(200).json({
      success: true,
      message: 'Navigation item updated successfully',
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) navigation item
 * DELETE /api/v1/admin/navigation/:id
 */
export const deleteNavigationItem = async (req, res, next) => {
  try {
    const { id } = req.params

    let item = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await NavigationItem.findById(id)
    }
    if (!item) {
      item = await NavigationItem.findOne({ legacyId: id })
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navigation item not found',
      })
    }

    item.isActive = false
    await item.save()

    return res.status(200).json({
      success: true,
      message: 'Navigation item deactivated successfully',
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}
