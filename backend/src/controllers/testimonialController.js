import mongoose from 'mongoose'
import Testimonial from '../models/Testimonial.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Public: Get active testimonials
 * GET /api/v1/testimonials
 */
export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Testimonials fetched successfully',
      data: { testimonials },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all testimonials (active & inactive)
 * GET /api/v1/admin/testimonials
 */
export const getAdminTestimonials = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { isActive, isFeatured, search } = req.query

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
        { location: searchRegex },
        { headline: searchRegex },
        { quote: searchRegex },
        { purchase: searchRegex },
      ]
    }

    const [testimonials, total] = await Promise.all([
      Testimonial.find(query).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Testimonial.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin testimonials fetched successfully',
      data: {
        testimonials,
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
 * Admin: Create testimonial
 * POST /api/v1/admin/testimonials
 */
export const createTestimonial = async (req, res, next) => {
  try {
    const data = { ...req.body }
    delete data._id

    if (!data.name || !data.quote) {
      return res.status(400).json({
        success: false,
        message: 'Name and quote are required.',
      })
    }

    if (!data.legacyId) {
      data.legacyId = `t${Date.now()}`
    }

    const existing = await Testimonial.findOne({ legacyId: data.legacyId })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Testimonial with legacyId '${data.legacyId}' already exists.`,
      })
    }

    const testimonial = await Testimonial.create(data)

    return res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: { testimonial },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate testimonial legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get testimonial by ID or legacyId
 * GET /api/v1/admin/testimonials/:id
 */
export const getTestimonialById = async (req, res, next) => {
  try {
    const { id } = req.params

    let testimonial = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      testimonial = await Testimonial.findById(id).lean()
    }
    if (!testimonial) {
      testimonial = await Testimonial.findOne({ legacyId: id }).lean()
    }

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Testimonial retrieved successfully',
      data: { testimonial },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update testimonial
 * PUT /api/v1/admin/testimonials/:id
 */
export const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    delete updateData._id

    let testimonial = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      testimonial = await Testimonial.findById(id)
    }
    if (!testimonial) {
      testimonial = await Testimonial.findOne({ legacyId: id })
    }

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      })
    }

    Object.assign(testimonial, updateData)
    await testimonial.save()

    return res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully',
      data: { testimonial },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) testimonial
 * DELETE /api/v1/admin/testimonials/:id
 */
export const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params

    let testimonial = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      testimonial = await Testimonial.findById(id)
    }
    if (!testimonial) {
      testimonial = await Testimonial.findOne({ legacyId: id })
    }

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      })
    }

    testimonial.isActive = false
    await testimonial.save()

    return res.status(200).json({
      success: true,
      message: 'Testimonial deactivated successfully',
      data: { testimonial },
    })
  } catch (error) {
    next(error)
  }
}
