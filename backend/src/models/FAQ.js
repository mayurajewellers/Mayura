import mongoose from 'mongoose'

const faqSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category title is required'],
      trim: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: [true, 'Category ID is required'],
      trim: true,
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

faqSchema.index({ categoryId: 1, isActive: 1, displayOrder: 1 })

const FAQ = mongoose.model('FAQ', faqSchema)

export default FAQ
