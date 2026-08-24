import mongoose from 'mongoose'
import Enquiry from '../models/Enquiry.js'
import { sendEnquiryEmails } from '../services/email/emailService.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Public: Submit customer enquiry
 * POST /api/v1/enquiries
 */
export const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, type, message, source } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required.',
      })
    }

    if (!email || !email.trim() || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      })
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      })
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty.',
      })
    }

    if (name.trim().length > 100 || message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Input length exceeds maximum allowed limit.',
      })
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: (type || subject || 'General enquiry').trim(),
      message: message.trim(),
      source: (source || 'contact').trim(),
      status: 'NEW',
      adminNotes: '',
      userId: req.user ? req.user._id : null,
      isActive: true,
    }

    const enquiry = await Enquiry.create(payload)

    // Trigger email side-effect safely (non-blocking for API response)
    sendEnquiryEmails(enquiry).catch((err) => {
      console.error(`[EMAIL_FAILED] Enquiry email side-effect failed: ${err.message}`)
    })

    return res.status(201).json({
      success: true,
      message: 'Thank you for your enquiry. We will reply shortly.',
      data: {
        enquiry: {
          _id: enquiry._id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          subject: enquiry.subject,
          status: enquiry.status,
          createdAt: enquiry.createdAt,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all enquiries
 * GET /api/v1/admin/enquiries
 */
export const getAdminEnquiries = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { status, source, isActive, search, sort } = req.query
    const query = {}

    if (status && status.trim()) {
      if (['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status.trim())) {
        query.status = status.trim()
      }
    }

    if (source && source.trim()) {
      query.source = source.trim()
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ]
    }

    let sortObj = { createdAt: -1 }
    if (sort === 'oldest') sortObj = { createdAt: 1 }

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin enquiries fetched successfully',
      data: {
        enquiries,
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
 * Admin: Get enquiry by ID
 * GET /api/v1/admin/enquiries/:id
 */
export const getEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
      })
    }

    const enquiry = await Enquiry.findById(id).lean()
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Enquiry retrieved successfully',
      data: { enquiry },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update enquiry status or admin notes
 * PUT /api/v1/admin/enquiries/:id
 */
export const updateEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, adminNotes, isActive } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
      })
    }

    const enquiry = await Enquiry.findById(id)
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      })
    }

    if (status) {
      if (!['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid enquiry status.',
        })
      }
      enquiry.status = status
    }

    if (adminNotes !== undefined) {
      enquiry.adminNotes = adminNotes.trim()
    }

    if (isActive !== undefined) {
      enquiry.isActive = Boolean(isActive)
    }

    await enquiry.save()

    return res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: { enquiry },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) enquiry
 * DELETE /api/v1/admin/enquiries/:id
 */
export const deleteEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid enquiry ID.',
      })
    }

    const enquiry = await Enquiry.findById(id)
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      })
    }

    enquiry.isActive = false
    await enquiry.save()

    return res.status(200).json({
      success: true,
      message: 'Enquiry deactivated successfully',
      data: { enquiry },
    })
  } catch (error) {
    next(error)
  }
}
