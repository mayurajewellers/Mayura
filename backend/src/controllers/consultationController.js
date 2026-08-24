import mongoose from 'mongoose'
import Consultation from '../models/Consultation.js'
import {
  sendConsultationRequestedEmails,
  sendConsultationConfirmedEmail,
  sendConsultationCancelledEmail,
} from '../services/email/emailService.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Public: Request a consultation
 * POST /api/v1/consultations
 */
export const createConsultation = async (req, res, next) => {
  try {
    const { name, email, phone, date, preferredDate, slot, preferredTime, consultationType, items, message, notes } = req.body

    if (!name || !name.trim() || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'A valid name (at least 2 characters) is required.',
      })
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      })
    }

    if (email && email.trim() && !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Provided email address is invalid.',
      })
    }

    const rawDate = date || preferredDate
    if (!rawDate) {
      return res.status(400).json({
        success: false,
        message: 'Preferred date is required.',
      })
    }

    const parsedDate = new Date(rawDate)
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferred date format.',
      })
    }

    // Check date is not in the past (allowing today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (parsedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Preferred date cannot be in the past.',
      })
    }

    const rawTime = slot || preferredTime
    if (!rawTime || !rawTime.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Preferred time slot is required.',
      })
    }

    const payload = {
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone.trim(),
      preferredDate: parsedDate,
      preferredTime: rawTime.trim(),
      consultationType: (consultationType || 'video').trim(),
      items: Array.isArray(items) ? items : [],
      message: (message || notes || '').trim(),
      status: 'REQUESTED',
      adminNotes: '',
      userId: req.user ? req.user._id : null,
      isActive: true,
    }

    const consultation = await Consultation.create(payload)

    // Trigger email side-effect safely (non-blocking)
    sendConsultationRequestedEmails(consultation).catch((err) => {
      console.error(`[EMAIL_FAILED] Consultation requested email failed: ${err.message}`)
    })

    return res.status(201).json({
      success: true,
      message: 'Consultation requested successfully. The store will confirm your slot shortly.',
      data: {
        consultation: {
          _id: consultation._id,
          name: consultation.name,
          phone: consultation.phone,
          preferredDate: consultation.preferredDate,
          preferredTime: consultation.preferredTime,
          consultationType: consultation.consultationType,
          status: consultation.status,
          createdAt: consultation.createdAt,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get all consultations
 * GET /api/v1/admin/consultations
 */
export const getAdminConsultations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { status, consultationType, isActive, search, sort } = req.query
    const query = {}

    if (status && status.trim()) {
      if (['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status.trim())) {
        query.status = status.trim()
      }
    }

    if (consultationType && consultationType.trim()) {
      query.consultationType = consultationType.trim()
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
        { message: searchRegex },
      ]
    }

    let sortObj = { preferredDate: 1, createdAt: -1 }
    if (sort === 'newest') sortObj = { createdAt: -1 }

    const [consultations, total] = await Promise.all([
      Consultation.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Consultation.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin consultations fetched successfully',
      data: {
        consultations,
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
 * Admin: Get consultation by ID
 * GET /api/v1/admin/consultations/:id
 */
export const getConsultationById = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consultation ID.',
      })
    }

    const consultation = await Consultation.findById(id).lean()
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Consultation retrieved successfully',
      data: { consultation },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update consultation status or notes
 * PUT /api/v1/admin/consultations/:id
 */
export const updateConsultation = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, adminNotes, preferredDate, preferredTime, isActive } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consultation ID.',
      })
    }

    const consultation = await Consultation.findById(id)
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found.',
      })
    }

    const oldStatus = consultation.status

    if (status) {
      if (!['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid consultation status.',
        })
      }
      consultation.status = status
    }

    if (adminNotes !== undefined) {
      consultation.adminNotes = adminNotes.trim()
    }

    if (preferredDate) {
      const pDate = new Date(preferredDate)
      if (!isNaN(pDate.getTime())) {
        consultation.preferredDate = pDate
      }
    }

    if (preferredTime) {
      consultation.preferredTime = preferredTime.trim()
    }

    if (isActive !== undefined) {
      consultation.isActive = Boolean(isActive)
    }

    await consultation.save()

    // Trigger status email side-effect safely if status changed (controller decides when to send)
    if (status && status !== oldStatus) {
      if (status === 'CONFIRMED') {
        sendConsultationConfirmedEmail(consultation).catch((err) => {
          console.error(`[EMAIL_FAILED] Consultation confirmation email failed: ${err.message}`)
        })
      } else if (status === 'CANCELLED') {
        sendConsultationCancelledEmail(consultation).catch((err) => {
          console.error(`[EMAIL_FAILED] Consultation cancellation email failed: ${err.message}`)
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      data: { consultation },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) consultation
 * DELETE /api/v1/admin/consultations/:id
 */
export const deleteConsultation = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid consultation ID.',
      })
    }

    const consultation = await Consultation.findById(id)
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found.',
      })
    }

    consultation.isActive = false
    await consultation.save()

    return res.status(200).json({
      success: true,
      message: 'Consultation deactivated successfully',
      data: { consultation },
    })
  } catch (error) {
    next(error)
  }
}
