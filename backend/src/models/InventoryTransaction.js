import mongoose from 'mongoose'

const inventoryTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    adjustment: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['STOCK_IN', 'STOCK_OUT', 'MANUAL_ADJUSTMENT', 'STOCK_CORRECTION', 'ORDER_DEDUCTION', 'ORDER_RESTOCK'],
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

inventoryTransactionSchema.index({ productId: 1, createdAt: -1 })

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema)

export default InventoryTransaction
