import mongoose from 'mongoose'
import Order from '../models/Order.js'
import { verifyPaymentSignature, verifyWebhookSignature } from '../services/payment/razorpayService.js'
import { dispatchEmail } from '../services/email/emailService.js'

/**
 * Public/Customer: Verify Razorpay Payment Signature
 * POST /api/v1/payments/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification fields (razorpayOrderId, razorpayPaymentId, razorpaySignature).',
      })
    }

    // Locate order
    let order = null
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      order = await Order.findOne({
        $or: [{ 'payment.razorpayOrderId': razorpayOrderId }, { orderNumber: orderId }],
      })
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found for payment verification.',
      })
    }

    // Perform HMAC signature check
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })

    if (!isValid) {
      order.payment.status = 'FAILED'
      order.payment.failureReason = 'Payment signature verification failed'
      await order.save()

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature.',
      })
    }

    // Mark paid idempotently
    order.payment.status = 'PAID'
    order.payment.razorpayPaymentId = razorpayPaymentId
    order.payment.razorpaySignature = razorpaySignature
    if (!order.payment.paidAt) {
      order.payment.paidAt = new Date()
    }

    if (order.status === 'PENDING_PAYMENT') {
      order.status = 'CONFIRMED'
    }

    await order.save()

    // Trigger payment confirmation email side-effect safely
    dispatchEmail({
      to: order.customer.email,
      templateName: 'paymentReceived',
      templateData: {
        subject: `Payment Received — ${order.orderNumber} | Mayura Jewellers`,
        html: `<p>We have successfully received your payment of <strong>₹${order.pricing.grandTotal.toLocaleString('en-IN')}</strong> for order <strong>${order.orderNumber}</strong>.</p>`,
        text: `Payment received for order ${order.orderNumber} (₹${order.pricing.grandTotal}).`,
      },
    }).catch((err) => {
      console.error(`[EMAIL_FAILED] Payment received email failed: ${err.message}`)
    })

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          payment: order.payment,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Public: Razorpay Webhook Endpoint
 * POST /api/v1/payments/webhook/razorpay
 */
export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Check webhook signature if secret configured
    if (webhookSecret) {
      const rawBody = req.rawBody || JSON.stringify(req.body)
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)

      if (!isValid) {
        console.error('[RAZORPAY_WEBHOOK] Invalid webhook signature detected.')
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' })
      }
    }

    const { event, payload } = req.body

    if (event === 'payment.captured' && payload?.payment?.entity) {
      const entity = payload.payment.entity
      const razorpayOrderId = entity.order_id
      const orderNumber = entity.notes?.orderNumber

      let order = await Order.findOne({
        $or: [{ 'payment.razorpayOrderId': razorpayOrderId }, { orderNumber }],
      })

      if (order && order.payment.status !== 'PAID') {
        order.payment.status = 'PAID'
        order.payment.razorpayPaymentId = entity.id
        if (!order.payment.paidAt) order.payment.paidAt = new Date()
        if (order.status === 'PENDING_PAYMENT') order.status = 'CONFIRMED'
        await order.save()
        console.log(`[RAZORPAY_WEBHOOK] Order ${order.orderNumber} marked PAID via webhook.`)
      }
    } else if (event === 'payment.failed' && payload?.payment?.entity) {
      const entity = payload.payment.entity
      const razorpayOrderId = entity.order_id
      const orderNumber = entity.notes?.orderNumber

      let order = await Order.findOne({
        $or: [{ 'payment.razorpayOrderId': razorpayOrderId }, { orderNumber }],
      })

      if (order && order.payment.status !== 'PAID') {
        order.payment.status = 'FAILED'
        order.payment.failureReason = entity.error_description || 'Payment failed via gateway'
        await order.save()
        console.log(`[RAZORPAY_WEBHOOK] Order ${order.orderNumber} marked FAILED via webhook.`)
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook event processed successfully.',
    })
  } catch (error) {
    next(error)
  }
}

export default {
  verifyPayment,
  handleRazorpayWebhook,
}
