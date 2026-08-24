import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema(
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
    eyebrow: {
      type: String,
      default: '',
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    lede: {
      type: String,
      default: '',
      trim: true,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
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

pageSchema.index({ slug: 1, isActive: 1 })

const Page = mongoose.model('Page', pageSchema)

export default Page
