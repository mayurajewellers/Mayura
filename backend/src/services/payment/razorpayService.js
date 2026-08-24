import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

export const isRazorpayConfigured = () => {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

/**
 * Create order on Razorpay Gateway
 * amount in rupees -> converted to paise (* 100)
 */
export const createGatewayOrder = async ({ amount, currency = 'INR', orderNumber, notes = {} }) => {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.log(`[RAZORPAY_MOCK] Credentials missing in environment. Returning test order ID.`)
    const mockOrderId = `rzp_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    return {
      success: true,
      isMock: true,
      razorpayOrderId: mockOrderId,
      amount: Math.round(amount * 100),
      currency,
      keyId: 'rzp_test_mock_key',
    }
  }

  const amountInPaise = Math.round(amount * 100)
  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: orderNumber,
      notes: {
        orderNumber,
        ...notes,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.description || `Razorpay order creation failed (${response.status})`)
  }

  return {
    success: true,
    isMock: false,
    razorpayOrderId: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId,
  }
}

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET

  // Fallback check for test mode mock signatures
  if (!keySecret) {
    console.log(`[RAZORPAY_MOCK] Verifying mock payment signature.`)
    return razorpaySignature.startsWith('valid_mock_sig_') || razorpaySignature === 'mock_valid_signature'
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  return expectedSignature === razorpaySignature
}

/**
 * Verify Razorpay Webhook signature
 */
export const verifyWebhookSignature = (bodyString, signature, secretOverride = null) => {
  const secret = secretOverride || process.env.RAZORPAY_WEBHOOK_SECRET

  if (!secret) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('hex')

  return expectedSignature === signature
}

export default {
  isRazorpayConfigured,
  createGatewayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
}
