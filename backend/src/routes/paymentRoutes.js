import express from 'express'
import {
  verifyPayment,
  handleRazorpayWebhook,
} from '../controllers/paymentController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * Customer: Verify Razorpay Payment Signature (Authentication Required)
 * POST /api/v1/payments/verify
 */
router.post('/verify', authenticate, verifyPayment)

/**
 * Webhook: Razorpay event webhook
 * POST /api/v1/payments/webhook/razorpay
 */
router.post('/webhook/razorpay', handleRazorpayWebhook)

export default router
