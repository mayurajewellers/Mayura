import mongoose from 'mongoose'

const galleryItemSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    src: {
      type: String,
      required: [true, 'Image source URL is required'],
      trim: true,
    },
    alt: {
      type: String,
      default: '',
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    span: {
      type: String,
      enum: ['normal', 'wide', 'tall'],
      default: 'normal',
    },
    group: {
      type: String,
      enum: ['Bridal', 'Gold', 'Craft', 'Portrait'],
      default: 'Bridal',
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

galleryItemSchema.index({ group: 1, isActive: 1, displayOrder: 1 })

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema)

export default GalleryItem
