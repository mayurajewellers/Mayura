import mongoose from 'mongoose'
import FAQ from '../models/FAQ.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Public: Get active FAQs
 * GET /api/v1/faqs
 */
export const getFAQs = async (req, res, next) => {
  try {
    const { category, categoryId } = req.query
    const query = { isActive: true }

    if (categoryId && categoryId.trim()) {
      query.categoryId = categoryId.trim()
    } else if (category && category.trim()) {
      query.category = category.trim()
    }

    const faqs = await FAQ.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'FAQs fetched successfully',
      data: { faqs },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all FAQs (active & inactive)
 * GET /api/v1/admin/faqs
 */
export const getAdminFAQs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { category, categoryId, isActive, isFeatured, search } = req.query
    const query = {}

    if (categoryId && categoryId.trim()) {
      query.categoryId = categoryId.trim()
    } else if (category && category.trim()) {
      query.category = category.trim()
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
        { question: searchRegex },
        { answer: searchRegex },
        { category: searchRegex },
        { categoryId: searchRegex },
      ]
    }

    const [faqs, total] = await Promise.all([
      FAQ.find(query).sort({ displayOrder: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
      FAQ.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin FAQs fetched successfully',
      data: {
        faqs,
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
 * Admin: Create FAQ
 * POST /api/v1/admin/faqs
 */
export const createFAQ = async (req, res, next) => {
  try {
    const data = { ...req.body }
    delete data._id

    if (!data.question || !data.answer || !data.category || !data.categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Question, answer, category, and categoryId are required fields.',
      })
    }

    if (!data.legacyId) {
      data.legacyId = `faq-${Date.now()}`
    }

    const existing = await FAQ.findOne({ legacyId: data.legacyId })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `FAQ with legacyId '${data.legacyId}' already exists.`,
      })
    }

    const faq = await FAQ.create(data)

    return res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: { faq },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate FAQ legacyId.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get FAQ by ID or legacyId
 * GET /api/v1/admin/faqs/:id
 */
export const getFAQById = async (req, res, next) => {
  try {
    const { id } = req.params

    let faq = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      faq = await FAQ.findById(id).lean()
    }
    if (!faq) {
      faq = await FAQ.findOne({ legacyId: id }).lean()
    }

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'FAQ retrieved successfully',
      data: { faq },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update FAQ
 * PUT /api/v1/admin/faqs/:id
 */
export const updateFAQ = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }
    delete updateData._id

    let faq = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      faq = await FAQ.findById(id)
    }
    if (!faq) {
      faq = await FAQ.findOne({ legacyId: id })
    }

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      })
    }

    Object.assign(faq, updateData)
    await faq.save()

    return res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: { faq },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) FAQ
 * DELETE /api/v1/admin/faqs/:id
 */
export const deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params

    let faq = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      faq = await FAQ.findById(id)
    }
    if (!faq) {
      faq = await FAQ.findOne({ legacyId: id })
    }

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      })
    }

    faq.isActive = false
    await faq.save()

    return res.status(200).json({
      success: true,
      message: 'FAQ deactivated successfully',
      data: { faq },
    })
  } catch (error) {
    next(error)
  }
}
