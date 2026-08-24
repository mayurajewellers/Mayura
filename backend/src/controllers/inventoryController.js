import mongoose from 'mongoose'
import Product from '../models/Product.js'
import InventoryTransaction from '../models/InventoryTransaction.js'

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Helper to compute stock status for plain JS product objects
 */
const getStockStatus = (qty, threshold = 5) => {
  if (qty <= 0) return 'OUT_OF_STOCK'
  if (qty <= threshold) return 'LOW_STOCK'
  return 'IN_STOCK'
}

/**
 * Admin: Get paginated inventory stock levels & warnings
 * GET /api/v1/admin/inventory
 */
export const getAdminInventory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { status, search } = req.query
    const query = { isActive: true }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [{ name: searchRegex }, { sku: searchRegex }, { type: searchRegex }]
    }

    let products = await Product.find(query).sort({ updatedAt: -1 }).lean()

    // Add virtual stockStatus to lean objects
    products = products.map((p) => {
      const qty = p.inventoryQuantity || 0
      const threshold = p.lowStockThreshold || 5
      return {
        ...p,
        stockStatus: getStockStatus(qty, threshold),
        inStock: qty > 0,
      }
    })

    // Filter by stock status if requested
    if (status) {
      const uStatus = status.trim().toUpperCase()
      if (uStatus === 'LOW_STOCK') {
        products = products.filter((p) => p.stockStatus === 'LOW_STOCK')
      } else if (uStatus === 'OUT_OF_STOCK') {
        products = products.filter((p) => p.stockStatus === 'OUT_OF_STOCK')
      } else if (uStatus === 'IN_STOCK') {
        products = products.filter((p) => p.stockStatus === 'IN_STOCK')
      }
    }

    const total = products.length
    const paginatedProducts = products.slice(skip, skip + limit)
    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin inventory list fetched successfully',
      data: {
        inventory: paginatedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get single product inventory details
 * GET /api/v1/admin/inventory/:productId
 */
export const getAdminInventoryById = async (req, res, next) => {
  try {
    const { productId } = req.params

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      })
    }

    const product = await Product.findById(productId).lean()
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    const qty = product.inventoryQuantity || 0
    const threshold = product.lowStockThreshold || 5
    const stockStatus = getStockStatus(qty, threshold)

    return res.status(200).json({
      success: true,
      message: 'Product inventory details fetched successfully',
      data: {
        product: {
          ...product,
          stockStatus,
          inStock: qty > 0,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Adjust product stock (ADD, REMOVE, SET) with reason & audit trail
 * POST /api/v1/admin/inventory/:productId/adjust
 */
export const adjustStock = async (req, res, next) => {
  try {
    const { productId } = req.params
    const { adjustmentType, quantity, reason } = req.body

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      })
    }

    const numQty = parseInt(quantity, 10)
    if (isNaN(numQty) || numQty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid non-negative number.',
      })
    }

    const validTypes = ['ADD', 'REMOVE', 'SET']
    const type = (adjustmentType || '').trim().toUpperCase()
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment type must be one of: ADD, REMOVE, SET.',
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      })
    }

    const previousQuantity = product.inventoryQuantity || 0
    let newQuantity = previousQuantity
    let delta = 0
    let txType = 'MANUAL_ADJUSTMENT'

    if (type === 'ADD') {
      delta = numQty
      newQuantity = previousQuantity + numQty
      txType = 'STOCK_IN'
    } else if (type === 'REMOVE') {
      if (numQty > previousQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot remove ${numQty} units. Current stock is only ${previousQuantity} units.`,
        })
      }
      delta = -numQty
      newQuantity = previousQuantity - numQty
      txType = 'STOCK_OUT'
    } else if (type === 'SET') {
      delta = numQty - previousQuantity
      newQuantity = numQty
      txType = delta >= 0 ? 'STOCK_IN' : 'STOCK_OUT'
    }

    // Atomic update
    product.inventoryQuantity = newQuantity
    product.inStock = newQuantity > 0
    await product.save()

    // Create Audit Transaction Record
    const adminUserId = req.user ? req.user._id : null
    const transaction = await InventoryTransaction.create({
      productId: product._id,
      previousQuantity,
      adjustment: delta,
      newQuantity,
      type: txType,
      reason: (reason || 'Manual stock adjustment').trim(),
      createdBy: adminUserId,
    })

    const stockStatus = getStockStatus(newQuantity, product.lowStockThreshold || 5)

    return res.status(200).json({
      success: true,
      message: `Stock adjusted successfully (${type} ${numQty} units). New stock: ${newQuantity}`,
      data: {
        product: {
          _id: product._id,
          name: product.name,
          sku: product.sku,
          inventoryQuantity: newQuantity,
          lowStockThreshold: product.lowStockThreshold,
          inStock: product.inStock,
          stockStatus,
        },
        transaction,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get transaction history logs for a product
 * GET /api/v1/admin/inventory/:productId/history
 */
export const getInventoryHistory = async (req, res, next) => {
  try {
    const { productId } = req.params
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      })
    }

    const query = { productId }

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryTransaction.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Inventory transaction history fetched successfully',
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
