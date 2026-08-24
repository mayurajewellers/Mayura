import mongoose from 'mongoose'
import Policy from '../models/Policy.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Public: Get active policies list
 * GET /api/v1/policies
 */
export const getPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Policies fetched successfully',
      data: { policies },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Public: Get single active policy by slug
 * GET /api/v1/policies/:slug
 */
export const getPolicyBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params

    const policy = await Policy.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    }).lean()

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or inactive',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Policy retrieved successfully',
      data: { policy },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all policies (active & inactive)
 * GET /api/v1/admin/policies
 */
export const getAdminPolicies = async (req, res, next) => {
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
      query.$or = [{ title: searchRegex }, { slug: searchRegex }, { intro: searchRegex }]
    }

    const [policies, total] = await Promise.all([
      Policy.find(query).sort({ displayOrder: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
      Policy.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin policies fetched successfully',
      data: {
        policies,
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
 * Admin: Create policy
 * POST /api/v1/admin/policies
 */
export const createPolicy = async (req, res, next) => {
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
      data.legacyId = `pol-${Date.now()}`
    }

    const existing = await Policy.findOne({ slug: data.slug })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Policy with slug '${data.slug}' already exists.`,
      })
    }

    const policy = await Policy.create(data)

    return res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      data: { policy },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate policy slug or legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get policy by ID or slug
 * GET /api/v1/admin/policies/:id
 */
export const getPolicyById = async (req, res, next) => {
  try {
    const { id } = req.params

    let policy = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      policy = await Policy.findById(id).lean()
    }
    if (!policy) {
      policy = await Policy.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      }).lean()
    }

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Policy retrieved successfully',
      data: { policy },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update policy
 * PUT /api/v1/admin/policies/:id
 */
export const updatePolicy = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    delete updateData._id

    let policy = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      policy = await Policy.findById(id)
    }
    if (!policy) {
      policy = await Policy.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      })
    }

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      })
    }

    if (updateData.slug && updateData.slug.toLowerCase().trim() !== policy.slug) {
      const existing = await Policy.findOne({
        slug: updateData.slug.toLowerCase().trim(),
        _id: { $ne: policy._id },
      })
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Policy with slug '${updateData.slug}' already exists.`,
        })
      }
      updateData.slug = updateData.slug.toLowerCase().trim()
    }

    Object.assign(policy, updateData)
    await policy.save()

    return res.status(200).json({
      success: true,
      message: 'Policy updated successfully',
      data: { policy },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate policy slug or legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) policy
 * DELETE /api/v1/admin/policies/:id
 */
export const deletePolicy = async (req, res, next) => {
  try {
    const { id } = req.params

    let policy = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      policy = await Policy.findById(id)
    }
    if (!policy) {
      policy = await Policy.findOne({
        $or: [{ legacyId: id }, { slug: id.toLowerCase().trim() }],
      })
    }

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      })
    }

    policy.isActive = false
    await policy.save()

    return res.status(200).json({
      success: true,
      message: 'Policy deactivated successfully',
      data: { policy },
    })
  } catch (error) {
    next(error)
  }
}
