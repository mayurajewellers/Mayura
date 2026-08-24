import mongoose from 'mongoose'

const navigationItemSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
    },
    icon: {
      type: String,
      default: '',
      trim: true,
    },
    to: {
      type: String,
      required: [true, 'Destination route/URL is required'],
      trim: true,
    },
    mega: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    section: {
      type: String,
      enum: ['category', 'service', 'footer'],
      default: 'category',
      index: true,
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

navigationItemSchema.index({ section: 1, isActive: 1, displayOrder: 1 })

const NavigationItem = mongoose.model('NavigationItem', navigationItemSchema)

export default NavigationItem
