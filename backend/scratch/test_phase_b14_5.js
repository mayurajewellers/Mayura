import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import Order from '../src/models/Order.js'

dotenv.config()

const PORT = 5098
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.5 AUTOMATED SECURITY & INTEGRATION TEST SUITE ===\n')

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  await mongoose.connect(mongoUri)

  server = http.createServer(app)
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`Test server listening on port ${PORT}\n`)

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
    // 1. Guest order creation must return 401 Unauthorized
    const rGuestOrder = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: 'dummy', quantity: 1 }] }),
    })
    assert(
      rGuestOrder.status === 401,
      '1. Guest order creation returns 401 Unauthorized (RequireCustomerAuth enforcement)',
    )

    // 2. Register new test customer
    const testEmail = `cust_b14_5_${Date.now()}@example.com`
    const rRegister = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer B14-5',
        email: testEmail,
        password: 'Password123!',
      }),
    }).then((r) => r.json())

    assert(
      rRegister.success === true && rRegister.data?.token !== undefined,
      '2. Customer registration succeeds and returns valid JWT',
    )

    const customerToken = rRegister.data?.token

    // 3. Customer Profile GET /api/v1/auth/me
    const rMe = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    }).then((r) => r.json())

    assert(
      rMe.success === true && rMe.data?.user?.role === 'CUSTOMER',
      '3. GET /api/v1/auth/me returns authenticated CUSTOMER profile',
    )

    const userIdStr = (rMe.data?.user?.id || rMe.data?.user?._id).toString()

    // 4. Create Order as Authenticated Customer
    const sampleProduct = await Product.findOne({ isActive: true })
    if (!sampleProduct) throw new Error('No active product found for test')

    const rCreateOrder = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            productId: sampleProduct._id.toString(),
            quantity: 1,
            selectedSize: '14',
            selectedPurity: '22K',
          },
        ],
        customer: {
          name: 'Test Customer B14-5',
          email: testEmail,
          phone: '+919876543210',
        },
        shippingAddress: {
          name: 'Test Customer B14-5',
          line1: 'Building 5, Thakur Village',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400101',
          country: 'India',
          phone: '+919876543210',
        },
        paymentMethod: 'COD',
      }),
    })

    const rCreateOrderData = await rCreateOrder.json()

    assert(
      rCreateOrder.status === 201 &&
        rCreateOrderData.success === true &&
        rCreateOrderData.data?.order?.orderNumber !== undefined,
      '4. Customer order creation succeeds (201 Created)',
    )

    const createdOrder = rCreateOrderData.data?.order

    // 5. Customer Order History GET /api/v1/orders
    const rOrdersHistory = await fetch(`${BASE_URL}/api/v1/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    }).then((r) => r.json())

    assert(
      rOrdersHistory.success === true &&
        Array.isArray(rOrdersHistory.data?.orders) &&
        rOrdersHistory.data.orders.some((o) => o._id.toString() === createdOrder._id.toString()),
      '5. GET /api/v1/orders returns customer order history containing created order',
    )

    // 6. Get Order Details GET /api/v1/orders/:id
    const rOrderDetails = await fetch(`${BASE_URL}/api/v1/orders/${createdOrder._id}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    }).then((r) => r.json())

    assert(
      rOrderDetails.success === true &&
        rOrderDetails.data?.order?.orderNumber === createdOrder.orderNumber,
      '6. GET /api/v1/orders/:id returns order details for owner',
    )

    // 7. Security: Verify User ID Spoofing in payload does not change ownership
    const fakeUserId = new mongoose.Types.ObjectId().toString()
    const spoofOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        userId: fakeUserId, // Attempt spoofing
        items: [{ productId: sampleProduct._id.toString(), quantity: 1 }],
        customer: {
          name: 'Spoof Test',
          email: testEmail,
          phone: '+919876543210',
        },
        shippingAddress: {
          name: 'Spoof Test',
          line1: 'Line 1',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400101',
          phone: '+919876543210',
        },
        paymentMethod: 'COD',
      }),
    }).then((r) => r.json())

    const spoofOrderData = spoofOrderRes.data?.order
    const spoofOrderInDb = await Order.findById(spoofOrderData._id)

    assert(
      spoofOrderInDb && spoofOrderInDb.userId.toString() === userIdStr,
      '7. Security: User ID spoofing in body ignored; order strictly bound to req.user._id',
    )

    console.log(`\n=== B-14.5 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
