import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Media name is required'],
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Media URL is required'],
      trim: true,
    },
    provider: {
      type: String,
      enum: ['local', 'cloudinary', 'external'],
      default: 'local',
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    mimeType: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    altText: {
      type: String,
      default: '',
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    folder: {
      type: String,
      default: 'general',
      trim: true,
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

const Media = mongoose.model('Media', mediaSchema)

export default Media
