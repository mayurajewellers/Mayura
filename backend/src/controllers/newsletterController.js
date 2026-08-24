import mongoose from 'mongoose'
import NewsletterSubscriber from '../models/NewsletterSubscriber.js'
import { sendNewsletterWelcomeEmail } from '../services/email/emailService.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Public: Subscribe to Mayura Insiders newsletter
 * POST /api/v1/insiders
 */
export const subscribe = async (req, res, next) => {
  try {
    const { email, segment, source } = req.body

    if (!email || !email.trim() || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      })
    }

    const normalisedEmail = email.trim().toLowerCase()

    let subscriber = await NewsletterSubscriber.findOne({ email: normalisedEmail })

    if (subscriber) {
      if (subscriber.status === 'SUBSCRIBED' && subscriber.isActive) {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to the Mayura Letter.',
          data: {
            alreadySubscribed: true,
            subscriber: {
              email: subscriber.email,
              status: subscriber.status,
              subscribedAt: subscriber.subscribedAt,
            },
          },
        })
      } else {
        // Reactivate unsubscribed or inactive account
        subscriber.status = 'SUBSCRIBED'
        subscriber.unsubscribedAt = null
        subscriber.subscribedAt = new Date()
        subscriber.isActive = true
        if (segment || source) {
          subscriber.source = (segment || source || 'website').trim()
        }
        await subscriber.save()

        // Trigger welcome email side-effect safely for reactivated subscriber
        sendNewsletterWelcomeEmail(subscriber).catch((err) => {
          console.error(`[EMAIL_FAILED] Newsletter welcome email failed: ${err.message}`)
        })

        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          data: {
            alreadySubscribed: false,
            subscriber: {
              email: subscriber.email,
              status: subscriber.status,
              subscribedAt: subscriber.subscribedAt,
            },
          },
        })
      }
    }

    // Create new subscriber
    subscriber = await NewsletterSubscriber.create({
      email: normalisedEmail,
      status: 'SUBSCRIBED',
      source: (segment || source || 'website').trim(),
      subscribedAt: new Date(),
      unsubscribedAt: null,
      isActive: true,
    })

    // Trigger welcome email side-effect safely for new subscriber
    sendNewsletterWelcomeEmail(subscriber).catch((err) => {
      console.error(`[EMAIL_FAILED] Newsletter welcome email failed: ${err.message}`)
    })

    return res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to the Mayura Letter.',
      data: {
        alreadySubscribed: false,
        subscriber: {
          email: subscriber.email,
          status: subscriber.status,
          subscribedAt: subscriber.subscribedAt,
        },
      },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to the Mayura Letter.',
        data: { alreadySubscribed: true },
      })
    }
    next(error)
  }
}

/**
 * Admin: Get all subscribers
 * GET /api/v1/admin/insiders
 */
export const getAdminSubscribers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { status, source, isActive, search, sort } = req.query
    const query = {}

    if (status && status.trim()) {
      if (['SUBSCRIBED', 'UNSUBSCRIBED'].includes(status.trim())) {
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
      query.email = new RegExp(safeSearch, 'i')
    }

    let sortObj = { subscribedAt: -1 }
    if (sort === 'oldest') sortObj = { subscribedAt: 1 }

    const [subscribers, total] = await Promise.all([
      NewsletterSubscriber.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      NewsletterSubscriber.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin subscribers fetched successfully',
      data: {
        subscribers,
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
 * Admin: Get subscriber by ID or email
 * GET /api/v1/admin/insiders/:id
 */
export const getSubscriberById = async (req, res, next) => {
  try {
    const { id } = req.params

    let subscriber = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      subscriber = await NewsletterSubscriber.findById(id).lean()
    }
    if (!subscriber) {
      subscriber = await NewsletterSubscriber.findOne({
        email: id.toLowerCase().trim(),
      }).lean()
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Subscriber retrieved successfully',
      data: { subscriber },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update subscriber status
 * PUT /api/v1/admin/insiders/:id
 */
export const updateSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, isActive } = req.body

    let subscriber = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      subscriber = await NewsletterSubscriber.findById(id)
    }
    if (!subscriber) {
      subscriber = await NewsletterSubscriber.findOne({
        email: id.toLowerCase().trim(),
      })
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found.',
      })
    }

    if (status) {
      if (!['SUBSCRIBED', 'UNSUBSCRIBED'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription status.',
        })
      }

      if (status === 'UNSUBSCRIBED' && subscriber.status !== 'UNSUBSCRIBED') {
        subscriber.status = 'UNSUBSCRIBED'
        subscriber.unsubscribedAt = new Date()
      } else if (status === 'SUBSCRIBED' && subscriber.status !== 'SUBSCRIBED') {
        subscriber.status = 'SUBSCRIBED'
        subscriber.unsubscribedAt = null
        subscriber.subscribedAt = new Date()
      }
    }

    if (isActive !== undefined) {
      subscriber.isActive = Boolean(isActive)
    }

    await subscriber.save()

    return res.status(200).json({
      success: true,
      message: 'Subscriber updated successfully',
      data: { subscriber },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Soft delete (deactivate) subscriber
 * DELETE /api/v1/admin/insiders/:id
 */
export const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params

    let subscriber = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      subscriber = await NewsletterSubscriber.findById(id)
    }
    if (!subscriber) {
      subscriber = await NewsletterSubscriber.findOne({
        email: id.toLowerCase().trim(),
      })
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found.',
      })
    }

    subscriber.isActive = false
    await subscriber.save()

    return res.status(200).json({
      success: true,
      message: 'Subscriber deactivated successfully',
      data: { subscriber },
    })
  } catch (error) {
    next(error)
  }
}
