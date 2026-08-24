import mongoose from 'mongoose'

const stoneSchema = new mongoose.Schema(
  {
    type: { type: String, trim: true },
    count: { type: Number, min: 0 },
    carat: { type: Number, min: 0 },
    quality: { type: String, trim: true },
    clarity: { type: String, trim: true },
    colour: { type: String, trim: true },
    cut: { type: String, trim: true },
    centre: { type: String, trim: true },
  },
  { _id: false },
)

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    options: [{ type: String, trim: true }],
    default: { type: String, trim: true },
  },
  { _id: false },
)

const goldOptionsSchema = new mongoose.Schema(
  {
    purities: [{ type: String, trim: true }],
    defaultPurity: { type: String, trim: true },
    shades: [{ type: String, trim: true }],
    defaultShade: { type: String, trim: true },
  },
  { _id: false },
)

const priceBreakupSchema = new mongoose.Schema(
  {
    goldValue: { type: Number, min: 0 },
    stoneValue: { type: Number, min: 0 },
    makingCharges: { type: Number, min: 0 },
    otherCharges: { type: Number, min: 0 },
    gst: { type: Number, min: 0 },
    total: { type: Number, min: 0 },
  },
  { _id: false },
)

const productSchema = new mongoose.Schema(
  {
    legacyId: {
      type: String,
      required: [true, 'Legacy product ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Product type is required'],
      trim: true,
      index: true,
    },
    collection: {
      type: String,
      required: [true, 'Product collection is required'],
      trim: true,
      index: true,
    },
    departments: {
      type: [{ type: String, trim: true }],
      default: [],
      index: true,
    },
    audience: {
      type: String,
      required: true,
      enum: ['women', 'men', 'unisex', 'kids'],
      default: 'women',
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      default: null,
    },
    images: {
      type: [{ type: String, trim: true }],
      required: [true, 'At least one product image is required'],
    },
    badge: {
      type: String,
      default: null,
      trim: true,
    },
    metal: {
      type: String,
      required: [true, 'Metal description is required'],
      trim: true,
    },
    metalKey: {
      type: String,
      required: [true, 'Metal key is required'],
      trim: true,
      index: true,
    },
    purity: {
      type: String,
      required: [true, 'Purity specification is required'],
      trim: true,
    },
    grossWeight: {
      type: Number,
      required: [true, 'Gross weight is required'],
      min: [0, 'Gross weight cannot be negative'],
    },
    netWeight: {
      type: Number,
      required: [true, 'Net weight is required'],
      min: [0, 'Net weight cannot be negative'],
    },
    makingCharges: {
      type: String,
      required: [true, 'Making charges description is required'],
      trim: true,
    },
    stones: {
      type: [stoneSchema],
      default: [],
    },
    size: {
      type: sizeSchema,
      default: null,
    },
    occasions: {
      type: [{ type: String, trim: true }],
      default: [],
      index: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    madeToOrder: {
      type: Boolean,
      default: false,
    },
    inventoryQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Inventory quantity cannot be negative'],
      index: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    inStock: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    shipping: {
      type: String,
      required: [true, 'Shipping information is required'],
      trim: true,
    },
    returns: {
      type: String,
      required: [true, 'Returns policy is required'],
      trim: true,
    },
    warranty: {
      type: String,
      default: 'Lifetime warranty against manufacturing defects.',
      trim: true,
    },
    certification: {
      type: String,
      required: [true, 'Certification details are required'],
      trim: true,
    },
    care: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    highlights: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    goldOptions: {
      type: goldOptionsSchema,
      default: null,
    },
    priceBreakup: {
      type: priceBreakupSchema,
      default: null,
    },
    styleTags: {
      type: [{ type: String, trim: true }],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    suppressReservedKeysWarning: true,
  },
)

/**
 * Sync inStock availability flag based on inventoryQuantity
 */
productSchema.pre('save', function (next) {
  this.inStock = (this.inventoryQuantity || 0) > 0
  next()
})

/**
 * Virtual: Derive stockStatus ('OUT_OF_STOCK', 'LOW_STOCK', 'IN_STOCK')
 */
productSchema.virtual('stockStatus').get(function () {
  const qty = this.inventoryQuantity || 0
  const threshold = this.lowStockThreshold || 5
  if (qty === 0) return 'OUT_OF_STOCK'
  if (qty <= threshold) return 'LOW_STOCK'
  return 'IN_STOCK'
})

// Compound indexes for common catalogue filter operations
productSchema.index({ isActive: 1, type: 1 })
productSchema.index({ isActive: 1, collection: 1 })
productSchema.index({ isActive: 1, price: 1 })
productSchema.index({ isActive: 1, isFeatured: 1 })
productSchema.index({ isActive: 1, inventoryQuantity: 1 })

const Product = mongoose.model('Product', productSchema)

export default Product
