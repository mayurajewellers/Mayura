import mongoose from 'mongoose'
import GalleryItem from '../models/GalleryItem.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

const isSafeUrl = (url) => {
  if (!url || typeof url !== 'string') return false
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

const ALLOWED_GROUPS = ['Bridal', 'Gold', 'Craft', 'Portrait']

/**
 * Public: Get active gallery items
 * GET /api/v1/gallery
 */
export const getGallery = async (req, res, next) => {
  try {
    const { group } = req.query
    const query = { isActive: true }

    if (group && group.trim() && group.trim() !== 'All') {
      if (ALLOWED_GROUPS.includes(group.trim())) {
        query.group = group.trim()
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid group filter. Allowed groups: ${ALLOWED_GROUPS.join(', ')}`,
        })
      }
    }

    const items = await GalleryItem.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Gallery items fetched successfully',
      data: { items },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all gallery items (active & inactive)
 * GET /api/v1/admin/gallery
 */
export const getAdminGallery = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { group, isActive, isFeatured, search } = req.query
    const query = {}

    if (group && group.trim() && group.trim() !== 'All') {
      if (ALLOWED_GROUPS.includes(group.trim())) {
        query.group = group.trim()
      }
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true' || isFeatured === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [{ alt: searchRegex }, { caption: searchRegex }, { group: searchRegex }]
    }

    const [items, total] = await Promise.all([
      GalleryItem.find(query).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      GalleryItem.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin gallery items fetched successfully',
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
 * Admin: Create gallery item
 * POST /api/v1/admin/gallery
 */
export const createGalleryItem = async (req, res, next) => {
  try {
    const data = { ...req.body }
    delete data._id

    if (!data.src) {
      return res.status(400).json({
        success: false,
        message: 'Image source (src) is required.',
      })
    }

    if (!isSafeUrl(data.src)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe image URL provided.',
      })
    }

    if (data.group && !ALLOWED_GROUPS.includes(data.group.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid group. Allowed values: ${ALLOWED_GROUPS.join(', ')}`,
      })
    }

    if (!data.legacyId) {
      data.legacyId = `gal-${Date.now()}`
    }

    const existing = await GalleryItem.findOne({ legacyId: data.legacyId })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Gallery item with legacyId '${data.legacyId}' already exists.`,
      })
    }

    const item = await GalleryItem.create(data)

    return res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: { item },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate gallery item legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get gallery item by ID or legacyId
 * GET /api/v1/admin/gallery/:id
 */
export const getGalleryItemById = async (req, res, next) => {
  try {
    const { id } = req.params

    let item = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await GalleryItem.findById(id).lean()
    }
    if (!item) {
      item = await GalleryItem.findOne({ legacyId: id }).lean()
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Gallery item retrieved successfully',
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update gallery item
 * PUT /api/v1/admin/gallery/:id
 */
export const updateGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    delete updateData._id

    let item = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await GalleryItem.findById(id)
    }
    if (!item) {
      item = await GalleryItem.findOne({ legacyId: id })
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      })
    }

    if (updateData.src && !isSafeUrl(updateData.src)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe image URL provided.',
      })
    }

    if (updateData.group && !ALLOWED_GROUPS.includes(updateData.group.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid group. Allowed values: ${ALLOWED_GROUPS.join(', ')}`,
      })
    }

    Object.assign(item, updateData)
    await item.save()

    return res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) gallery item
 * DELETE /api/v1/admin/gallery/:id
 */
export const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params

    let item = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await GalleryItem.findById(id)
    }
    if (!item) {
      item = await GalleryItem.findOne({ legacyId: id })
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      })
    }

    item.isActive = false
    await item.save()

    return res.status(200).json({
      success: true,
      message: 'Gallery item deactivated successfully',
      data: { item },
    })
  } catch (error) {
    next(error)
  }
}
