import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import Order from '../src/models/Order.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5096
const BASE_URL = `http://localhost:${PORT}`

let server
let customerToken = ''
let customerUser = null

const runTests = async () => {
  console.log('=== STARTING CHECKOUT AUTHENTICATION GATE SECURITY TESTS ===\n')

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  await mongoose.connect(mongoUri)

  server = http.createServer(app)
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`Test server listening on port ${PORT}\n`)

  // Setup customer user
  customerUser = await User.findOne({ email: 'checkout_gate_test@mayura.com' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Checkout Gate Test Customer',
      email: 'checkout_gate_test@mayura.com',
      passwordHash: 'HashedPassword123!',
      role: 'CUSTOMER',
      isActive: true,
    })
  }
  customerToken = signToken({ userId: customerUser._id, role: customerUser.role })

  const activeProduct = await Product.findOne({ isActive: true, price: { $gt: 0 } })
  if (!activeProduct) throw new Error('No active product found for test orders.')

  let passed = 0
  let failed = 0

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`[PASS] ${title}`)
      passed++
    } else {
      console.error(`[FAIL] ${title} - ${details}`)
      failed++
    }
  }

  try {
    const validOrderBody = {
      items: [{ productId: activeProduct._id.toString(), quantity: 1 }],
      customer: { name: 'Gate Test', email: customerUser.email, phone: '9876543210' },
      shippingAddress: { line1: '456 Gate St', city: 'Mumbai', state: 'MH', pincode: '400001' },
      paymentMethod: 'COD',
    }

    // 1. Unauthenticated order request rejected (401 Unauthorized)
    const rUnauthOrder = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validOrderBody),
    })
    assert(rUnauthOrder.status === 401, '1. POST /api/v1/orders without JWT returns 401 Unauthorized')

    // 2. Customer order request with JWT allowed (201 Created)
    const rAuthOrder = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(validOrderBody),
    }).then((r) => r.json())

    assert(
      rAuthOrder.success === true && (rAuthOrder.data?.order?.orderNumber || rAuthOrder.data?.orderNumber),
      '2. POST /api/v1/orders with Customer JWT returns 201 Created',
    )

    const createdOrderNumber = rAuthOrder.data?.order?.orderNumber || rAuthOrder.data?.orderNumber
    const createdOrder = await Order.findOne({ orderNumber: createdOrderNumber })

    // 3. UserID ownership strictly bound to JWT user ID (ignoring client payload spoofing)
    const rSpoofOrder = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        ...validOrderBody,
        userId: '60c72b2f9b1e8a0015f8d999', // Fake client spoofed ID
      }),
    }).then((r) => r.json())

    const spoofedOrderNumber = rSpoofOrder.data?.order?.orderNumber || rSpoofOrder.data?.orderNumber
    const spoofedOrder = await Order.findOne({ orderNumber: spoofedOrderNumber })
    assert(
      spoofedOrder && spoofedOrder.userId.toString() === customerUser._id.toString(),
      '3. Order.userId strictly derived from req.user._id (JWT), ignoring client spoofed userId payload',
    )

    // 4. Payment verify without JWT rejected (401 Unauthorized)
    const rUnauthVerify = await fetch(`${BASE_URL}/api/v1/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpay_order_id: 'order_fake', razorpay_payment_id: 'pay_fake', razorpay_signature: 'sig_fake' }),
    })
    assert(rUnauthVerify.status === 401, '4. POST /api/v1/payments/verify without JWT returns 401 Unauthorized')

    // 5. Razorpay webhook endpoint accessible without customer JWT
    const rWebhook = await fetch(`${BASE_URL}/api/v1/payments/webhook/razorpay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment.captured' }),
    })
    assert(rWebhook.status !== 401, '5. Razorpay webhook remains accessible without customer JWT for server-to-server calls')

    // Cleanup test orders
    if (createdOrder) await Order.deleteOne({ _id: createdOrder._id })
    if (spoofedOrder) await Order.deleteOne({ _id: spoofedOrder._id })

    console.log(`\n=== CHECKOUT AUTH SECURITY TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
