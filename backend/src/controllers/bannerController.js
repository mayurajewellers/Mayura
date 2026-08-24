import mongoose from 'mongoose'
import Banner from '../models/Banner.js'

/**
 * Utility to escape regex characters for search safety
 */
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Utility to check URL safety against unsafe executable schemes
 */
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

const ALLOWED_PLACEMENTS = [
  'homepage-hero',
  'homepage-promo',
  'collection-banner',
  'category-banner',
  'modal-banner',
]

/**
 * Public: Get active, currently valid banners
 * GET /api/v1/banners
 */
export const getBanners = async (req, res, next) => {
  try {
    const { placement } = req.query

    const now = new Date()

    const query = {
      isActive: true,
      $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
      ],
    }

    if (placement && placement.trim()) {
      if (ALLOWED_PLACEMENTS.includes(placement.trim())) {
        query.placement = placement.trim()
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid placement filter. Allowed placements: ${ALLOWED_PLACEMENTS.join(', ')}`,
        })
      }
    }

    const banners = await Banner.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Banners fetched successfully',
      data: { banners },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Public: Get single active banner by slug
 * GET /api/v1/banners/:slug
 */
export const getBannerBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params
    const now = new Date()

    const banner = await Banner.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
      $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
      ],
    }).lean()

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found or inactive',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Banner retrieved successfully',
      data: { banner },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get paginated list of all banners (active & inactive)
 * GET /api/v1/admin/banners
 */
export const getAdminBanners = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { placement, isActive, isFeatured, search, sort } = req.query

    const query = {}

    if (placement && placement.trim()) {
      if (ALLOWED_PLACEMENTS.includes(placement.trim())) {
        query.placement = placement.trim()
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
      query.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { headline: searchRegex },
        { eyebrow: searchRegex },
        { description: searchRegex },
      ]
    }

    let sortObj = { displayOrder: 1, createdAt: -1 }
    if (sort === 'newest') sortObj = { createdAt: -1 }
    if (sort === 'oldest') sortObj = { createdAt: 1 }
    if (sort === 'title') sortObj = { title: 1 }

    const [banners, total] = await Promise.all([
      Banner.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Banner.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin banners fetched successfully',
      data: {
        banners,
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
 * Admin: Create new banner
 * POST /api/v1/admin/banners
 */
export const createBanner = async (req, res, next) => {
  try {
    const bannerData = { ...req.body }

    delete bannerData._id

    if (!bannerData.title || !bannerData.slug || !bannerData.placement || !bannerData.desktopImage) {
      return res.status(400).json({
        success: false,
        message: 'Title, slug, placement, and desktopImage are required fields.',
      })
    }

    if (!ALLOWED_PLACEMENTS.includes(bannerData.placement.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid placement. Allowed values: ${ALLOWED_PLACEMENTS.join(', ')}`,
      })
    }

    if (!isSafeUrl(bannerData.desktopImage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe desktopImage URL provided.',
      })
    }

    if (bannerData.mobileImage && !isSafeUrl(bannerData.mobileImage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe mobileImage URL provided.',
      })
    }

    if (bannerData.link && !isSafeUrl(bannerData.link)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe link URL provided.',
      })
    }

    // Check date range if startAt and endAt are both provided
    if (bannerData.startAt && bannerData.endAt) {
      const startDate = new Date(bannerData.startAt)
      const endDate = new Date(bannerData.endAt)
      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message: 'endAt cannot be earlier than startAt.',
        })
      }
    }

    bannerData.slug = bannerData.slug.toLowerCase().trim()

    // Check duplicate slug
    const existing = await Banner.findOne({ slug: bannerData.slug })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Banner with slug '${bannerData.slug}' already exists.`,
      })
    }

    const banner = await Banner.create(bannerData)

    return res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: { banner },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate banner slug.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get single banner by ID or slug
 * GET /api/v1/admin/banners/:id
 */
export const getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params

    let banner = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      banner = await Banner.findById(id).lean()
    }
    if (!banner) {
      banner = await Banner.findOne({ slug: id.toLowerCase().trim() }).lean()
    }

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Banner retrieved successfully',
      data: { banner },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update banner by ID or slug
 * PUT /api/v1/admin/banners/:id
 */
export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    delete updateData._id

    let banner = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      banner = await Banner.findById(id)
    }
    if (!banner) {
      banner = await Banner.findOne({ slug: id.toLowerCase().trim() })
    }

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      })
    }

    if (updateData.placement && !ALLOWED_PLACEMENTS.includes(updateData.placement.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid placement. Allowed values: ${ALLOWED_PLACEMENTS.join(', ')}`,
      })
    }

    if (updateData.desktopImage && !isSafeUrl(updateData.desktopImage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe desktopImage URL provided.',
      })
    }

    if (updateData.mobileImage && !isSafeUrl(updateData.mobileImage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe mobileImage URL provided.',
      })
    }

    if (updateData.link && !isSafeUrl(updateData.link)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe link URL provided.',
      })
    }

    // Check date range if updating dates
    const startAt = updateData.startAt !== undefined ? updateData.startAt : banner.startAt
    const endAt = updateData.endAt !== undefined ? updateData.endAt : banner.endAt
    if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
      return res.status(400).json({
        success: false,
        message: 'endAt cannot be earlier than startAt.',
      })
    }

    // Check slug uniqueness if changing
    if (updateData.slug && updateData.slug.toLowerCase().trim() !== banner.slug) {
      const existing = await Banner.findOne({
        slug: updateData.slug.toLowerCase().trim(),
        _id: { $ne: banner._id },
      })
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Banner with slug '${updateData.slug}' already exists.`,
        })
      }
      updateData.slug = updateData.slug.toLowerCase().trim()
    }

    Object.assign(banner, updateData)
    await banner.save()

    return res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      data: { banner },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate banner slug.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft-delete (deactivate) banner
 * DELETE /api/v1/admin/banners/:id
 */
export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params

    let banner = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      banner = await Banner.findById(id)
    }
    if (!banner) {
      banner = await Banner.findOne({ slug: id.toLowerCase().trim() })
    }

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      })
    }

    banner.isActive = false
    await banner.save()

    return res.status(200).json({
      success: true,
      message: 'Banner deactivated successfully',
      data: { banner },
    })
  } catch (error) {
    next(error)
  }
}
