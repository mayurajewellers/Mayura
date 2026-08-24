import mongoose from 'mongoose'
import Page from '../models/Page.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Public: Get active pages list
 * GET /api/v1/pages
 */
export const getPages = async (req, res, next) => {
  try {
    const pages = await Page.find({ isActive: true }).select('-sections').lean()

    return res.status(200).json({
      success: true,
      message: 'Pages fetched successfully',
      data: { pages },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Public: Get single page by slug
 * GET /api/v1/pages/:slug
 */
export const getPageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const page = await Page.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    }).lean()

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found or inactive',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Page retrieved successfully',
      data: { page },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all pages (active & inactive)
 * GET /api/v1/admin/pages
 */
export const getAdminPages = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { isActive, search } = req.query
    const query = {}

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [{ title: searchRegex }, { slug: searchRegex }, { lede: searchRegex }]
    }

    const [pages, total] = await Promise.all([
      Page.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Page.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin pages fetched successfully',
      data: {
        pages,
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
 * Admin: Create page
 * POST /api/v1/admin/pages
 */
export const createPage = async (req, res, next) => {
  try {
    const data = { ...req.body }
    delete data._id

    if (!data.title || !data.slug || !data.sections) {
      return res.status(400).json({
        success: false,
        message: 'Title, slug, and sections are required fields.',
      })
    }

    data.slug = data.slug.toLowerCase().trim()

    if (!data.legacyId) {
      data.legacyId = `page-${Date.now()}`
    }

    const existing = await Page.findOne({ slug: data.slug })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Page with slug '${data.slug}' already exists.`,
      })
    }

    const page = await Page.create(data)

    return res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: { page },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate page slug or legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get page by ID or slug
 * GET /api/v1/admin/pages/:id
 */
export const getPageById = async (req, res, next) => {
  try {
    const { id } = req.params

    let page = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      page = await Page.findById(id).lean()
    }
    if (!page) {
      page = await Page.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      }).lean()
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Page retrieved successfully',
      data: { page },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update page
 * PUT /api/v1/admin/pages/:id
 */
export const updatePage = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    delete updateData._id

    let page = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      page = await Page.findById(id)
    }
    if (!page) {
      page = await Page.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      })
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      })
    }

    if (updateData.slug && updateData.slug.toLowerCase().trim() !== page.slug) {
      const existing = await Page.findOne({
        slug: updateData.slug.toLowerCase().trim(),
        _id: { $ne: page._id },
      })
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Page with slug '${updateData.slug}' already exists.`,
        })
      }
      updateData.slug = updateData.slug.toLowerCase().trim()
    }

    Object.assign(page, updateData)
    await page.save()

    return res.status(200).json({
      success: true,
      message: 'Page updated successfully',
      data: { page },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate page slug or legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) page
 * DELETE /api/v1/admin/pages/:id
 */
export const deletePage = async (req, res, next) => {
  try {
    const { id } = req.params

    let page = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      page = await Page.findById(id)
    }
    if (!page) {
      page = await Page.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      })
    }

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      })
    }

    page.isActive = false
    await page.save()

    return res.status(200).json({
      success: true,
      message: 'Page deactivated successfully',
      data: { page },
    })
  } catch (error) {
    next(error)
  }
}
