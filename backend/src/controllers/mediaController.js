import mongoose from 'mongoose'
import Media from '../models/Media.js'
import Banner from '../models/Banner.js'
import { uploadBuffer } from '../services/cloudinary/cloudinaryService.js'

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

/**
 * Configure Cloudinary v2 SDK if environment variables exist
 */

/**
 * Admin: Upload device file to Cloudinary & register Media document in MongoDB
 * POST /api/v1/admin/media/upload
 */
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file attached to upload request. Please select a valid file.',
      })
    }

    const { folder = 'mayura/uploads', altText = '', caption = '' } = req.body
    const originalName = req.file.originalname || `upload-${Date.now()}`
    const sanitizedName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
    const publicId = `${folder}/${sanitizedName}_${Date.now()}`

    // Upload to Cloudinary (returns null when credentials are not configured)
    const uploadedResult = await uploadBuffer(req.file.buffer, {
      folder,
      public_id: `${sanitizedName}_${Date.now()}`,
      resourceType: 'auto',
    })

    const secureUrl = uploadedResult?.secure_url || uploadedResult?.url || `/images/uploads/${Date.now()}_${originalName}`
    const finalPublicId = uploadedResult?.public_id || publicId

    // Persist Media Document in MongoDB
    const media = await Media.create({
      name: originalName,
      publicId: finalPublicId,
      url: secureUrl,
      secureUrl: secureUrl,
      provider: uploadedResult ? 'cloudinary' : 'local',
      resourceType: uploadedResult?.resource_type || 'image',
      format: uploadedResult?.format || originalName.split('.').pop() || 'jpg',
      bytes: req.file.size || uploadedResult?.bytes || 0,
      width: uploadedResult?.width || 800,
      height: uploadedResult?.height || 800,
      folder: folder,
      altText: altText || originalName,
      caption: caption || originalName,
      isActive: true,
    })

    return res.status(201).json({
      success: true,
      message: 'Media asset uploaded and persisted successfully',
      data: { media },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get paginated list of media items
 * GET /api/v1/admin/media
 */
export const getAdminMedia = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { folder, provider, isActive, search } = req.query

    const query = {}

    if (folder && folder.trim()) {
      query.folder = folder.trim()
    }

    if (provider && provider.trim()) {
      query.provider = provider.trim()
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { name: searchRegex },
        { publicId: searchRegex },
        { altText: searchRegex },
        { caption: searchRegex },
        { folder: searchRegex },
      ]
    }

    const [mediaItems, total] = await Promise.all([
      Media.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Media.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin media list fetched successfully',
      data: {
        media: mediaItems,
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
 * Admin: Create new media record
 * POST /api/v1/admin/media
 */
export const createMedia = async (req, res, next) => {
  try {
    const mediaData = { ...req.body }

    delete mediaData._id

    if (!mediaData.name || !mediaData.publicId || !mediaData.url) {
      return res.status(400).json({
        success: false,
        message: 'Name, publicId, and url are required fields.',
      })
    }

    if (!isSafeUrl(mediaData.url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe media URL provided.',
      })
    }

    mediaData.publicId = mediaData.publicId.trim()

    const existing = await Media.findOne({ publicId: mediaData.publicId })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Media with publicId '${mediaData.publicId}' already exists.`,
      })
    }

    const media = await Media.create(mediaData)

    return res.status(201).json({
      success: true,
      message: 'Media record created successfully',
      data: { media },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate publicId for media record.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Get single media record by ID or publicId
 * GET /api/v1/admin/media/:id
 */
export const getMediaById = async (req, res, next) => {
  try {
    const { id } = req.params

    let media = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      media = await Media.findById(id).lean()
    }
    if (!media) {
      media = await Media.findOne({ publicId: id }).lean()
    }

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media record not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Media record retrieved successfully',
      data: { media },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update media record
 * PUT /api/v1/admin/media/:id
 */
export const updateMedia = async (req, res, next) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    delete updateData._id

    let media = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      media = await Media.findById(id)
    }
    if (!media) {
      media = await Media.findOne({ publicId: id })
    }

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media record not found',
      })
    }

    if (updateData.url && !isSafeUrl(updateData.url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsafe media URL provided.',
      })
    }

    if (updateData.publicId && updateData.publicId !== media.publicId) {
      const existing = await Media.findOne({
        publicId: updateData.publicId,
        _id: { $ne: media._id },
      })
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Media with publicId '${updateData.publicId}' already exists.`,
        })
      }
    }

    Object.assign(media, updateData)
    await media.save()

    return res.status(200).json({
      success: true,
      message: 'Media record updated successfully',
      data: { media },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate publicId for media record.',
      })
    }
    next(error)
  }
}

/**
 * Admin: Soft-delete (deactivate) media record
 * DELETE /api/v1/admin/media/:id
 */
export const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params

    let media = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      media = await Media.findById(id)
    }
    if (!media) {
      media = await Media.findOne({ publicId: id })
    }

    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media record not found',
      })
    }

    const referencedBanner = await Banner.findOne({
      $or: [{ desktopImage: media.url }, { mobileImage: media.url }],
      isActive: true,
    })

    if (referencedBanner) {
      return res.status(409).json({
        success: false,
        message: `Cannot deactivate media because it is currently referenced by active banner '${referencedBanner.title}'.`,
      })
    }

    media.isActive = false
    await media.save()

    return res.status(200).json({
      success: true,
      message: 'Media record deactivated successfully',
      data: { media },
    })
  } catch (error) {
    next(error)
  }
}
