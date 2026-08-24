import mongoose from 'mongoose'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import InventoryTransaction from '../models/InventoryTransaction.js'
import { createGatewayOrder } from '../services/payment/razorpayService.js'
import { dispatchEmail, getAdminRecipientEmail } from '../services/email/emailService.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const COUPONS = {
  MAYURA10: 0.03,
  FESTIVE: 0.05,
}

const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

/**
 * Helper to calculate authoritative pricing
 */
const calculateOrderPricing = (items, couponCode = '') => {
  let subtotal = 0

  const validatedItems = items.map((item) => {
    const lineTotal = Math.round(item.unitPrice * item.quantity)
    subtotal += lineTotal
    return {
      ...item,
      lineTotal,
    }
  })

  const code = (couponCode || '').trim().toUpperCase()
  const discountRate = COUPONS[code] || 0
  const discount = Math.round(subtotal * discountRate)

  const shipping = subtotal >= 25000 || subtotal === 0 ? 0 : 250
  const grandTotal = Math.max(0, subtotal - discount + shipping)

  return {
    validatedItems,
    pricing: {
      subtotal,
      discount,
      couponCode: discount > 0 ? code : '',
      shipping,
      tax: 0, // Inclusive of 3% GST
      grandTotal,
      currency: 'INR',
    },
  }
}

/**
 * Public & Customer: Create a new order
 * POST /api/v1/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to place an order.',
      })
    }

    const {
      items,
      customer,
      shippingAddress,
      billingAddress,
      deliveryMethod,
      paymentMethod,
      couponCode,
      notes,
      isGift,
    } = req.body

    // 1. Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.',
      })
    }

    if (items.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 20 lines allowed per order.',
      })
    }

    // 2. Validate customer information
    if (!customer || typeof customer !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Customer information is required.',
      })
    }

    const { name, email, phone } = customer
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required.',
      })
    }

    if (!email || !email.trim() || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid customer email is required.',
      })
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number is required.',
      })
    }

    // 3. Validate shipping address
    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required.',
      })
    }

    const { line1, city, state, pincode } = shippingAddress
    if (!line1 || !line1.trim() || !city || !city.trim() || !state || !state.trim() || !pincode || !pincode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address (line1, city, state, pincode) is required.',
      })
    }

    // 4. Validate every product against MongoDB (Authoritative Price & Existence Check)
    const preparedItems = []

    for (const rawItem of items) {
      if (!rawItem.productId || !mongoose.Types.ObjectId.isValid(rawItem.productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID in order items.`,
        })
      }

      const quantity = parseInt(rawItem.quantity, 10)
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be a positive number greater than 0.',
        })
      }

      if (quantity > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 units allowed per item line.',
        })
      }

      const product = await Product.findById(rawItem.productId)
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID '${rawItem.productId}' was not found.`,
        })
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product '${product.name}' is inactive and cannot be purchased.`,
        })
      }

      if (product.inventoryQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product '${product.name}'. Available: ${product.inventoryQuantity}, Requested: ${quantity}.`,
        })
      }

      // Ignore frontend-submitted price and use MongoDB authoritative price
      const unitPrice = product.price

      preparedItems.push({
        productId: product._id,
        legacyId: product.id || '',
        sku: product.sku || '',
        slug: product.slug || '',
        name: product.name,
        image: product.images?.[0] || '',
        quantity,
        unitPrice,
        selectedOptions: {
          size: rawItem.size || rawItem.selectedOptions?.size || null,
          variant: rawItem.variant || rawItem.selectedOptions?.variant || null,
        },
      })
    }

    // 5. Calculate authoritative pricing
    const { validatedItems, pricing } = calculateOrderPricing(preparedItems, couponCode)

    // 6. Normalize Payment & Delivery method
    const normPaymentMethod = (paymentMethod || 'COD').toUpperCase().trim()
    const validMethods = ['UPI', 'CARD', 'BANK', 'STORE', 'COD', 'RAZORPAY']
    const finalPaymentMethod = validMethods.includes(normPaymentMethod) ? normPaymentMethod : 'COD'

    const normDeliveryMethod = (deliveryMethod || 'standard').toLowerCase().trim()
    const validDeliveries = ['standard', 'hand', 'collect']
    const finalDeliveryMethod = validDeliveries.includes(normDeliveryMethod) ? normDeliveryMethod : 'standard'

    // Initial status assignment
    const initialOrderStatus = finalPaymentMethod === 'RAZORPAY' ? 'PENDING_PAYMENT' : 'CONFIRMED'
    const initialPaymentStatus = 'PENDING'

    // Generate Order Number
    const orderNumber = Order.generateOrderNumber()

    // Create Razorpay Gateway order if RAZORPAY method selected
    let gatewayData = null
    if (finalPaymentMethod === 'RAZORPAY') {
      try {
        gatewayData = await createGatewayOrder({
          amount: pricing.grandTotal,
          currency: 'INR',
          orderNumber,
          notes: { customerEmail: email.trim().toLowerCase() },
        })
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: `Payment gateway initialization failed: ${err.message}`,
        })
      }
    }

    const orderPayload = {
      orderNumber,
      userId: req.user ? req.user._id : null,
      customer: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      },
      shippingAddress: {
        name: shippingAddress.name ? shippingAddress.name.trim() : name.trim(),
        phone: shippingAddress.phone ? shippingAddress.phone.trim() : phone.trim(),
        line1: line1.trim(),
        line2: (shippingAddress.line2 || '').trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: (shippingAddress.country || 'India').trim(),
        notes: (notes || shippingAddress.notes || '').trim(),
      },
      billingAddress: billingAddress
        ? {
            name: (billingAddress.name || name).trim(),
            phone: (billingAddress.phone || phone).trim(),
            line1: (billingAddress.line1 || line1).trim(),
            line2: (billingAddress.line2 || '').trim(),
            city: (billingAddress.city || city).trim(),
            state: (billingAddress.state || state).trim(),
            pincode: (billingAddress.pincode || pincode).trim(),
            country: (billingAddress.country || 'India').trim(),
          }
        : null,
      items: validatedItems,
      pricing,
      payment: {
        method: finalPaymentMethod,
        status: initialPaymentStatus,
        razorpayOrderId: gatewayData?.razorpayOrderId || null,
      },
      delivery: {
        method: finalDeliveryMethod,
        estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
      },
      status: initialOrderStatus,
      isGift: Boolean(isGift),
      isActive: true,
    }

    const order = await Order.create(orderPayload)

    // Deduct inventory atomically if order is confirmed (non-gateway/COD/UPI/etc.)
    if (order.status === 'CONFIRMED') {
      for (const item of order.items) {
        const updatedProd = await Product.findOneAndUpdate(
          { _id: item.productId, inventoryQuantity: { $gte: item.quantity } },
          { $inc: { inventoryQuantity: -item.quantity } },
          { new: true },
        )
        if (updatedProd) {
          updatedProd.inStock = updatedProd.inventoryQuantity > 0
          await updatedProd.save()

          await InventoryTransaction.create({
            productId: item.productId,
            previousQuantity: updatedProd.inventoryQuantity + item.quantity,
            adjustment: -item.quantity,
            newQuantity: updatedProd.inventoryQuantity,
            type: 'ORDER_DEDUCTION',
            reason: `Order ${order.orderNumber} confirmed`,
            orderId: order._id,
          })
        }
      }
    }

    // Trigger fail-safe email side-effect (non-blocking)
    dispatchEmail({
      to: order.customer.email,
      templateName: 'orderConfirmation',
      templateData: {
        subject: `Order Confirmation — ${order.orderNumber} | Mayura Jewellers`,
        html: `<p>Thank you for your order <strong>${order.orderNumber}</strong> totaling ₹${order.pricing.grandTotal.toLocaleString('en-IN')}. We are preparing your selection.</p>`,
        text: `Thank you for your order ${order.orderNumber} totaling ₹${order.pricing.grandTotal}.`,
      },
    }).catch((err) => {
      console.error(`[EMAIL_FAILED] Order confirmation email failed: ${err.message}`)
    })

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        razorpay: gatewayData,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Customer (Authenticated): Get customer's order history
 * GET /api/v1/orders
 */
export const getCustomerOrders = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view orders.',
      })
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { status } = req.query
    const query = { userId: req.user._id, isActive: true }

    if (status && status.trim()) {
      query.status = status.trim().toUpperCase()
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    const cleanedOrders = orders.map((o) => {
      const { adminNotes, ...rest } = o
      return rest
    })

    return res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders: cleanedOrders,
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
 * Public & Customer: Get order by ID or order number
 * GET /api/v1/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params

    let order = null

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean()
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: id.trim().toUpperCase() }).lean()
    }

    if (!order || !order.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    // Ownership Verification Rule
    if (req.user) {
      if (req.user.role !== 'ADMIN' && String(order.userId) !== String(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order.',
        })
      }
    } else {
      // Guest verification via query parameter verification (email or phone)
      const { email, phone } = req.query
      if (!email && !phone) {
        return res.status(401).json({
          success: false,
          message: 'Authentication or verification parameters required to view guest order.',
        })
      }

      const emailMatches = email && email.trim().toLowerCase() === order.customer.email
      const phoneMatches = phone && phone.trim() === order.customer.phone

      if (!emailMatches && !phoneMatches) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order.',
        })
      }
    }

    if (order) {
      delete order.adminNotes
    }

    return res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: { order },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Get list of all orders
 * GET /api/v1/admin/orders
 */
export const getAdminOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20))
    const skip = (page - 1) * limit

    const { status, paymentStatus, paymentMethod, search, sort } = req.query
    const query = { isActive: true }

    if (status && status.trim()) {
      query.status = status.trim().toUpperCase()
    }

    if (paymentStatus && paymentStatus.trim()) {
      query['payment.status'] = paymentStatus.trim().toUpperCase()
    }

    if (paymentMethod && paymentMethod.trim()) {
      query['payment.method'] = paymentMethod.trim().toUpperCase()
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim())
      const searchRegex = new RegExp(safeSearch, 'i')
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex },
      ]
    }

    let sortObj = { createdAt: -1 }
    if (sort === 'oldest') sortObj = { createdAt: 1 }

    const [orders, total] = await Promise.all([
      Order.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return res.status(200).json({
      success: true,
      message: 'Admin orders fetched successfully',
      data: {
        orders,
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
 * Admin: Get order details by ID
 * GET /api/v1/admin/orders/:id
 */
export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params

    let order = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean()
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: id.trim().toUpperCase() }).lean()
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Admin order retrieved successfully',
      data: { order },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Admin: Update order status, tracking info, or admin notes
 * PUT /api/v1/admin/orders/:id
 */
export const updateAdminOrder = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, paymentStatus, adminNotes, trackingNumber, courierName, estimatedDelivery, isActive } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.',
      })
    }

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      })
    }

    const oldStatus = order.status
    const oldPaymentStatus = order.payment.status

    if (status) {
      const allowedStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
      if (!allowedStatuses.includes(status.trim())) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status. Must be one of: ${allowedStatuses.join(', ')}`,
        })
      }
      order.status = status.trim()

      // Restock inventory if order was cancelled
      if (order.status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
        for (const item of order.items) {
          const updatedProd = await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { inventoryQuantity: item.quantity } },
            { new: true },
          )
          if (updatedProd) {
            updatedProd.inStock = updatedProd.inventoryQuantity > 0
            await updatedProd.save()

            await InventoryTransaction.create({
              productId: item.productId,
              previousQuantity: updatedProd.inventoryQuantity - item.quantity,
              adjustment: item.quantity,
              newQuantity: updatedProd.inventoryQuantity,
              type: 'ORDER_RESTOCK',
              reason: `Order ${order.orderNumber} cancelled`,
              orderId: order._id,
              createdBy: req.user ? req.user._id : null,
            })
          }
        }
      }
    }

    if (paymentStatus) {
      const allowedPaymentStatuses = ['PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED']
      if (!allowedPaymentStatuses.includes(paymentStatus.trim())) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment status. Must be one of: ${allowedPaymentStatuses.join(', ')}`,
        })
      }
      order.payment.status = paymentStatus.trim()
      if (paymentStatus.trim() === 'PAID' && !order.payment.paidAt) {
        order.payment.paidAt = new Date()
      }
    }

    if (adminNotes !== undefined) {
      order.adminNotes = adminNotes.trim()
    }

    if (trackingNumber !== undefined) {
      order.delivery.trackingNumber = trackingNumber.trim()
    }

    if (courierName !== undefined) {
      order.delivery.courierName = courierName.trim()
    }

    if (estimatedDelivery) {
      const pDate = new Date(estimatedDelivery)
      if (!isNaN(pDate.getTime())) {
        order.delivery.estimatedDelivery = pDate
      }
    }

    if (isActive !== undefined) {
      order.isActive = Boolean(isActive)
    }

    await order.save()

    // Trigger status change emails if status changed
    if (order.status !== oldStatus) {
      if (order.status === 'SHIPPED') {
        dispatchEmail({
          to: order.customer.email,
          templateName: 'orderShipped',
          templateData: {
            subject: `Order Shipped — ${order.orderNumber} | Mayura Jewellers`,
            html: `<p>Your order <strong>${order.orderNumber}</strong> has been shipped via ${order.delivery.courierName || 'Insured Courier'}. Tracking Number: ${order.delivery.trackingNumber || 'N/A'}.</p>`,
            text: `Your order ${order.orderNumber} has been shipped. Tracking: ${order.delivery.trackingNumber || 'N/A'}.`,
          },
        }).catch((err) => console.error(`[EMAIL_FAILED] Shipped email failed: ${err.message}`))
      } else if (order.status === 'CANCELLED') {
        dispatchEmail({
          to: order.customer.email,
          templateName: 'orderCancelled',
          templateData: {
            subject: `Order Cancelled — ${order.orderNumber} | Mayura Jewellers`,
            html: `<p>Your order <strong>${order.orderNumber}</strong> has been cancelled.</p>`,
            text: `Your order ${order.orderNumber} has been cancelled.`,
          },
        }).catch((err) => console.error(`[EMAIL_FAILED] Cancelled email failed: ${err.message}`))
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: { order },
    })
  } catch (error) {
    next(error)
  }
}

export default {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrder,
}
