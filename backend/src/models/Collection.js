import mongoose from 'mongoose'

const collectionSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      required: [true, 'Legacy collection ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Collection slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    meaning: {
      type: String,
      default: '',
      trim: true,
    },
    kicker: {
      type: String,
      default: '',
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    intro: {
      type: String,
      default: '',
      trim: true,
    },
    story: {
      type: String,
      default: '',
      trim: true,
    },
    heroImage: {
      type: String,
      default: '',
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    detailImage: {
      type: String,
      default: '',
      trim: true,
    },
    pieces: {
      type: String,
      default: '',
      trim: true,
    },
    palette: {
      type: String,
      default: 'gold',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
)

// Compound indexes for sorting and status queries
collectionSchema.index({ isActive: 1, displayOrder: 1 })
collectionSchema.index({ isActive: 1, isFeatured: 1 })

const Collection = mongoose.model('Collection', collectionSchema)

export default Collection
