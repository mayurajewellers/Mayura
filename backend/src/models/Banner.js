import mongoose from 'mongoose'

const ctaSchema = new mongoose.Schema(
  {
    label: { type: String, default: '', trim: true },
    href: { type: String, default: '', trim: true },
    target: { type: String, default: '_self', enum: ['_self', '_blank'] },
  },
  { _id: false },
)

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Banner slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    placement: {
      type: String,
      required: [true, 'Placement is required'],
      enum: ['homepage-hero', 'homepage-promo', 'collection-banner', 'category-banner', 'modal-banner'],
      trim: true,
      index: true,
    },
    eyebrow: {
      type: String,
      default: '',
      trim: true,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
    },
    subheadline: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    desktopImage: {
      type: String,
      required: [true, 'Desktop image URL is required'],
      trim: true,
    },
    mobileImage: {
      type: String,
      default: null,
      trim: true,
    },
    cta: {
      type: ctaSchema,
      default: () => ({}),
    },
    secondaryCta: {
      type: ctaSchema,
      default: () => ({}),
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    startAt: {
      type: Date,
      default: null,
      index: true,
    },
    endAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for active banner queries sorted by placement and displayOrder
bannerSchema.index({ placement: 1, isActive: 1, displayOrder: 1 })

const Banner = mongoose.model('Banner', bannerSchema)

export default Banner
