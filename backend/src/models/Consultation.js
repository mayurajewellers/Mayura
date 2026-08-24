import mongoose from 'mongoose'

const consultationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
      index: true,
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time slot is required'],
      trim: true,
    },
    consultationType: {
      type: String,
      default: 'video',
      trim: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    message: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

consultationSchema.index({ status: 1, preferredDate: 1 })
consultationSchema.index({ email: 1, createdAt: -1 })

const Consultation = mongoose.model('Consultation', consultationSchema)

export default Consultation
