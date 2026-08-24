import mongoose from 'mongoose'

const policySchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    kicker: {
      type: String,
      default: 'Legal',
      trim: true,
    },
    updated: {
      type: Date,
      default: Date.now,
    },
    intro: {
      type: String,
      default: '',
      trim: true,
    },
    variant: {
      type: String,
      default: 'sections',
      trim: true,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Sections are required'],
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
    seo: {
      metaTitle: { type: String, default: '', trim: true },
      metaDescription: { type: String, default: '', trim: true },
      keywords: [{ type: String, trim: true }],
    },
  },
  {
    timestamps: true,
  },
)

policySchema.index({ slug: 1, isActive: 1 })

const Policy = mongoose.model('Policy', policySchema)

export default Policy
