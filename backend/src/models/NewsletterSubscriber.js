import mongoose from 'mongoose'

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUBSCRIBED', 'UNSUBSCRIBED'],
      default: 'SUBSCRIBED',
      index: true,
    },
    source: {
      type: String,
      default: 'website',
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

newsletterSubscriberSchema.index({ status: 1, subscribedAt: -1 })

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema)

export default NewsletterSubscriber
