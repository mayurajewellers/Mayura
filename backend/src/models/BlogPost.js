import mongoose from 'mongoose'

const blogPostSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Buying Guides', 'Jewellery Care', 'Bridal', 'Gold Investment', 'Trends'],
      trim: true,
      index: true,
    },
    author: {
      type: String,
      default: 'Mayura Atelier',
      trim: true,
    },
    readTime: {
      type: Number,
      default: 5,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
      trim: true,
    },
    secondaryImage: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
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

// Index for public query sorting and filtering
blogPostSchema.index({ status: 1, isActive: 1, publishedAt: -1 })
blogPostSchema.index({ category: 1, status: 1, isActive: 1 })

const BlogPost = mongoose.model('BlogPost', blogPostSchema)

export default BlogPost
