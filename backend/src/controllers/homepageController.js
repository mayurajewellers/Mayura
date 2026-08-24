import mongoose from 'mongoose'
import HomepageSection from '../models/HomepageSection.js'

/**
 * Utility to escape regex characters for search safety
 */
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Public: Get active homepage sections ordered by displayOrder
 * GET /api/v1/homepage
 */
export const getHomepage = async (req, res, next) => {
  try {
    const sections = await HomepageSection.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Homepage fetched successfully',
      data: { sections },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all homepage sections (active & inactive)
 * GET /api/v1/admin/homepage
 */
export const getAdminHomepage = async (req, res, next) => {
  try {
    const { search, isActive } = req.query

    const query = {}

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { key: searchRegex },
        { type: searchRegex },
        { title: searchRegex },
        { subtitle: searchRegex },
      ]
    }

    const sections = await HomepageSection.find(query)
      .sort({ displayOrder: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Admin homepage sections fetched successfully',
      data: { sections },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Create new homepage section
 * POST /api/v1/admin/homepage/sections
 */
export const createHomepageSection = async (req, res, next) => {
  try {
    const sectionData = { ...req.body }

    delete sectionData._id

    if (!sectionData.key || !sectionData.type) {
      return res.status(400).json({
        success: false,
        message: 'Section key and type are required.',
      })
    }

    sectionData.key = sectionData.key.toLowerCase().trim()

    // Check duplicate key
    const existingKey = await HomepageSection.findOne({ key: sectionData.key })
    if (existingKey) {
      return res.status(409).json({
        success: false,
        message: `Homepage section with key '${sectionData.key}' already exists.`,
      })
    }

    const section = await HomepageSection.create(sectionData)

    return res.status(201).json({
      success: true,
      message: 'Homepage section created successfully',
      data: { section },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate section key.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get single homepage section by ID or key
 * GET /api/v1/admin/homepage/sections/:id
 */
export const getHomepageSectionById = async (req, res, next) => {
  try {
    const { id } = req.params

    let section = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      section = await HomepageSection.findById(id).lean()
    }
    if (!section) {
      section = await HomepageSection.findOne({ key: id.toLowerCase() }).lean()
    }

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Homepage section retrieved successfully',
      data: { section },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update homepage section by ID or key
 * PUT /api/v1/admin/homepage/sections/:id
 */
export const updateHomepageSection = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    delete updateData._id

    let section = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      section = await HomepageSection.findById(id)
    }
    if (!section) {
      section = await HomepageSection.findOne({ key: id.toLowerCase() })
    }

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found',
      })
    }

    // Duplicate check if key is changing
    if (updateData.key && updateData.key.toLowerCase() !== section.key) {
      const existingKey = await HomepageSection.findOne({
        key: updateData.key.toLowerCase(),
        _id: { $ne: section._id },
      })
      if (existingKey) {
        return res.status(409).json({
          success: false,
          message: `Homepage section with key '${updateData.key}' already exists.`,
        })
      }
      updateData.key = updateData.key.toLowerCase()
    }

    Object.assign(section, updateData)
    await section.save()

    return res.status(200).json({
      success: true,
      message: 'Homepage section updated successfully',
      data: { section },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate section key.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft delete / deactivate homepage section
 * DELETE /api/v1/admin/homepage/sections/:id
 */
export const deleteHomepageSection = async (req, res, next) => {
  try {
    const { id } = req.params

    let section = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      section = await HomepageSection.findById(id)
    }
    if (!section) {
      section = await HomepageSection.findOne({ key: id.toLowerCase() })
    }

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found',
      })
    }

    // Soft delete (deactivate)
    section.isActive = false
    await section.save()

    return res.status(200).json({
      success: true,
      message: 'Homepage section deactivated successfully',
      data: { section },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Bulk reorder homepage sections
 * PUT /api/v1/admin/homepage/reorder
 */
export const reorderHomepageSections = async (req, res, next) => {
  try {
    const { sections } = req.body

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payload must contain a non-empty sections array with id and displayOrder.',
      })
    }

    const bulkOps = sections.map((item) => {
      const query = mongoose.Types.ObjectId.isValid(item.id)
        ? { _id: item.id }
        : { key: item.id.toLowerCase() }

      return {
        updateOne: {
          filter: query,
          update: { $set: { displayOrder: Number(item.displayOrder) || 0 } },
        },
      }
    })

    await HomepageSection.bulkWrite(bulkOps)

    const updatedSections = await HomepageSection.find()
      .sort({ displayOrder: 1 })
      .lean()

    return res.status(200).json({
      success: true,
      message: 'Homepage sections reordered successfully',
      data: { sections: updatedSections },
    })
  } catch (error) {
    next(error)
  }
}
