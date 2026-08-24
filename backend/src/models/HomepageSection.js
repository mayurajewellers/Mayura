import mongoose from 'mongoose'

const homepageSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Section key is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Section type is required'],
      enum: ['hero', 'categories', 'advantages', 'promises', 'brands', 'cuts', 'insiders', 'custom'],
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    items: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
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
  },
  {
    timestamps: true,
  },
)

// Index for active public querying sorted by displayOrder
homepageSectionSchema.index({ isActive: 1, displayOrder: 1 })

const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema)

export default HomepageSection
