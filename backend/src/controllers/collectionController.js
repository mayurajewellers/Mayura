import mongoose from 'mongoose'
import Collection from '../models/Collection.js'

/**
 * Utility to escape regex characters for search safety
 */
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Public: Get active collections
 * GET /api/v1/collections
 */
export const getCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Collections fetched successfully',
      data: { collections },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Public: Get single active collection by slug
 * GET /api/v1/collections/:slug
 */
export const getCollectionBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const collection = await Collection.findOne({
      slug: slug.toLowerCase(),
      isActive: true,
    }).lean()

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Collection retrieved successfully',
      data: { collection },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Create new collection
 * POST /api/v1/admin/collections
 */
export const createCollection = async (req, res, next) => {
  try {
    const collectionData = { ...req.body }

    delete collectionData._id

    if (!collectionData.name) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required.',
      })
    }

    if (!collectionData.slug) {
      collectionData.slug = collectionData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    } else {
      collectionData.slug = collectionData.slug.toLowerCase().trim()
    }

    if (!collectionData.legacyId) {
      collectionData.legacyId = `COL-${collectionData.slug.toUpperCase()}`
    }

    // Check duplicate slug
    const existingSlug = await Collection.findOne({ slug: collectionData.slug })
    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: `Collection with slug '${collectionData.slug}' already exists.`,
      })
    }

    // Check duplicate legacyId
    const existingLegacy = await Collection.findOne({ legacyId: collectionData.legacyId })
    if (existingLegacy) {
      return res.status(409).json({
        success: false,
        message: `Collection with legacyId '${collectionData.legacyId}' already exists.`,
      })
    }

    const collection = await Collection.create(collectionData)

    return res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      data: { collection },
    })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'unique field'
      return res.status(409).json({
        success: false,
        message: `Duplicate collection value for ${field}.`,
      })
    }
    next(error)
  }
}

/**
 * Admin: Get all collections (active & inactive) with filtering/pagination
 * GET /api/v1/admin/collections
 */
export const getAdminCollections = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      isFeatured,
      sort = 'displayOrder',
    } = req.query

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20))
    const skip = (pageNum - 1) * limitNum

    const query = {}

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true' || isFeatured === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { name: searchRegex },
        { slug: searchRegex },
        { legacyId: searchRegex },
        { tagline: searchRegex },
        { kicker: searchRegex },
        { description: searchRegex },
        { intro: searchRegex },
      ]
    }

    let sortOption = { displayOrder: 1, name: 1 }
    switch (sort) {
      case 'name-asc':
        sortOption = { name: 1 }
        break
      case 'newest':
        sortOption = { createdAt: -1 }
        break
      case 'oldest':
        sortOption = { createdAt: 1 }
        break
      case 'displayOrder':
      default:
        sortOption = { displayOrder: 1, name: 1 }
        break
    }

    const [collections, total] = await Promise.all([
      Collection.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Collection.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limitNum) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin collections fetched successfully',
      data: {
        collections,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get single collection by ID, legacyId, or slug
 * GET /api/v1/admin/collections/:id
 */
export const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params

    let collection = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      collection = await Collection.findById(id).lean()
    }
    if (!collection) {
      collection = await Collection.findOne({ legacyId: id }).lean()
    }
    if (!collection) {
      collection = await Collection.findOne({ slug: id.toLowerCase() }).lean()
    }

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Collection retrieved successfully',
      data: { collection },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update collection by ID
 * PUT /api/v1/admin/collections/:id
 */
export const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    delete updateData._id

    let collection = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      collection = await Collection.findById(id)
    }
    if (!collection) {
      collection = await Collection.findOne({ legacyId: id })
    }
    if (!collection) {
      collection = await Collection.findOne({ slug: id.toLowerCase() })
    }

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      })
    }

    // Duplicate check if slug is changing
    if (updateData.slug && updateData.slug.toLowerCase() !== collection.slug) {
      const existingSlug = await Collection.findOne({
        slug: updateData.slug.toLowerCase(),
        _id: { $ne: collection._id },
      })
      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: `Collection with slug '${updateData.slug}' already exists.`,
        })
      }
      updateData.slug = updateData.slug.toLowerCase()
    }

    Object.assign(collection, updateData)
    await collection.save()

    return res.status(200).json({
      success: true,
      message: 'Collection updated successfully',
      data: { collection },
    })
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'unique field'
      return res.status(409).json({
        success: false,
        message: `Duplicate collection value for ${field}.`,
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft delete / deactivate collection
 * DELETE /api/v1/admin/collections/:id
 */
export const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params

    let collection = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      collection = await Collection.findById(id)
    }
    if (!collection) {
      collection = await Collection.findOne({ legacyId: id })
    }
    if (!collection) {
      collection = await Collection.findOne({ slug: id.toLowerCase() })
    }

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found',
      })
    }

    // Soft delete (deactivate)
    collection.isActive = false
    await collection.save()

    return res.status(200).json({
      success: true,
      message: 'Collection deactivated successfully',
      data: { collection },
    })
  } catch (error) {
    next(error)
  }
}
