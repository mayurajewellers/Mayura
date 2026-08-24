import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Exclude passwordHash from queries by default
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'ADMIN'], // EXACTLY TWO ROLES ALLOWED System-Wide
      default: 'CUSTOMER',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    addresses: [
      {
        name: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
        line1: { type: String, trim: true, default: '' },
        line2: { type: String, trim: true, default: '' },
        city: { type: String, trim: true, default: '' },
        state: { type: String, trim: true, default: '' },
        pincode: { type: String, trim: true, default: '' },
        country: { type: String, trim: true, default: 'India' },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  },
)

/**
 * Compare plain candidate password against passwordHash using bcrypt
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash)
};

/**
 * Return safe user representation excluding passwordHash and internal Mongoose fields
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    phone: this.phone || '',
    role: this.role,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    avatar: this.avatar || '',
    addresses: this.addresses || [],
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

const User = mongoose.model('User', userSchema)

export default User
