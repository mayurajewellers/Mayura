import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    legacyId: { type: String, default: '' },
    sku: { type: String, default: '' },
    slug: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    selectedOptions: {
      size: { type: String, default: null },
      variant: {
        purity: { type: String, default: null },
        shade: { type: String, default: null },
      },
    },
  },
  { _id: true },
)

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    notes: { type: String, default: '', trim: true },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true, index: true },
      phone: { type: String, required: true, trim: true, index: true },
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    billingAddress: {
      type: addressSchema,
      default: null,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val) => val.length > 0, 'Order must contain at least one item.'],
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, default: '', uppercase: true, trim: true },
      shipping: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR', uppercase: true, trim: true },
    },
    payment: {
      method: {
        type: String,
        enum: ['UPI', 'CARD', 'BANK', 'STORE', 'COD', 'RAZORPAY'],
        required: true,
      },
      status: {
        type: String,
        enum: ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
        index: true,
      },
      razorpayOrderId: { type: String, default: null, index: true },
      razorpayPaymentId: { type: String, default: null, index: true },
      razorpaySignature: { type: String, default: null },
      paidAt: { type: Date, default: null },
      failureReason: { type: String, default: '' },
    },
    delivery: {
      method: {
        type: String,
        enum: ['standard', 'hand', 'collect'],
        default: 'standard',
      },
      estimatedDelivery: { type: Date, default: null },
      trackingNumber: { type: String, default: '' },
      courierName: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    adminNotes: { type: String, default: '', trim: true },
    isGift: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  },
)

/**
 * Generate human readable order number e.g. MJ-2026-104829
 */
orderSchema.statics.generateOrderNumber = function () {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `MJ-${year}-${random}`
}

const Order = mongoose.model('Order', orderSchema)

export default Order
