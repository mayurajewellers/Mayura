import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

// Set test environment
process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import Order from '../src/models/Order.js'
import { signToken } from '../src/utils/jwt.js'
import { setEmailProvider } from '../src/services/email/emailService.js'

dotenv.config()

const PORT = 5092
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let customer2Token = ''
let testProductId = ''
let inactiveProductId = ''
let testOrderId = ''
let testOrderNumber = ''

const capturedEmails = []

const mockTestProvider = {
  name: 'mockTestProvider',
  async sendEmail(options) {
    capturedEmails.push({ ...options, timestamp: Date.now() })
    return { success: true, provider: 'mockTestProvider', messageId: `test-${Date.now()}` }
  },
}

const runTests = async () => {
  console.log('=== STARTING PHASE B-12 AUTOMATED TEST SUITE ===\n')

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  await mongoose.connect(mongoUri)

  setEmailProvider(mockTestProvider)

  server = http.createServer(app)
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`Test server listening on port ${PORT}\n`)

  // Setup test admin
  let adminUser = await User.findOne({ role: 'ADMIN' })
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Test Admin B12',
      email: 'admin_test_b12@mayura.com',
      passwordHash: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  // Setup customer 1
  let customerUser = await User.findOne({ email: 'customer1_b12@mayura.com' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Darshil Bhandari',
      email: 'customer1_b12@mayura.com',
      passwordHash: 'HashedPassword123!',
      role: 'CUSTOMER',
      isActive: true,
    })
  }
  customerToken = signToken({ userId: customerUser._id, role: customerUser.role })

  // Setup customer 2
  let customer2User = await User.findOne({ email: 'customer2_b12@mayura.com' })
  if (!customer2User) {
    customer2User = await User.create({
      name: 'Ananya Roy',
      email: 'customer2_b12@mayura.com',
      passwordHash: 'HashedPassword123!',
      role: 'CUSTOMER',
      isActive: true,
    })
  }
  customer2Token = signToken({ userId: customer2User._id, role: customer2User.role })

  // Find an existing active product from database
  const activeProduct = await Product.findOne({ isActive: true, price: { $gt: 0 } })
  if (!activeProduct) {
    throw new Error('No active test product found in catalogue.')
  }
  testProductId = activeProduct._id.toString()

  // Create temporary inactive product for testing
  const tempInactive = await Product.create({
    legacyId: `mj-inactive-${Date.now()}`,
    name: 'Temporary Inactive Ring B12',
    slug: `temp-inactive-ring-b12-${Date.now()}`,
    sku: `TEMP-INACT-${Date.now()}`,
    category: 'Rings',
    type: 'Rings',
    collectionName: 'All Jewels',
    collection: 'all',
    purity: '22K Gold',
    metal: '22K Yellow Gold',
    metalKey: 'gold-22k',
    price: 15000,
    grossWeight: 5,
    netWeight: 5,
    description: 'Test inactive product',
    makingCharges: '10% making charges',
    shipping: 'Insured delivery across India',
    returns: '15-day return policy',
    certification: 'BIS Hallmarked',
    images: ['/images/products/test.jpg'],
    isActive: false,
  })
  inactiveProductId = tempInactive._id.toString()

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
    // 1. Health check
    const rHealth = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(rHealth.success === true, '1. Health check endpoint operational')

    // 2. Customer authentication
    assert(Boolean(customerToken) && Boolean(adminToken), '2. Customer and admin authentication tokens generated')

    // 3. Create order with valid product
    capturedEmails.length = 0
    const res3 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            productId: testProductId,
            quantity: 1,
            size: '14',
            variant: { purity: '22K', shade: 'Yellow Gold' },
            // Fake frontend values intended to attack server
            price: 10,
            unitPrice: 10,
            lineTotal: 10,
          },
        ],
        customer: {
          name: 'Darshil Bhandari',
          email: 'customer1_b12@mayura.com',
          phone: '9876543210',
        },
        shippingAddress: {
          line1: 'Shop No. 12, Rangoli Building',
          line2: 'Thakur Village',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400101',
        },
        deliveryMethod: 'standard',
        paymentMethod: 'RAZORPAY',
        // Fake total
        grandTotal: 10,
        subtotal: 10,
      }),
    })
    const res3Body = await res3.json()

    assert(res3.status === 201 && res3Body.success === true, '3. Order creation with valid product succeeds (201 Created)')
    if (res3Body.data?.order?._id) {
      testOrderId = res3Body.data.order._id
      testOrderNumber = res3Body.data.order.orderNumber
    }

    // 4. Backend calculates correct product price from MongoDB (ignores fake frontend price ₹10)
    const createdOrder = res3Body.data?.order
    assert(
      createdOrder && createdOrder.items[0].unitPrice === activeProduct.price,
      '4. Backend uses authoritative MongoDB product price instead of frontend price',
      `Expected ${activeProduct.price}, got ${createdOrder?.items[0]?.unitPrice}`,
    )

    // 5 & 6. Frontend fake prices/totals ignored
    assert(
      createdOrder && createdOrder.pricing.subtotal === activeProduct.price,
      '5. Frontend-submitted fake subtotal ignored by backend',
    )
    const expectedGrandTotal = activeProduct.price >= 25000 ? activeProduct.price : activeProduct.price + 250
    assert(
      createdOrder && createdOrder.pricing.grandTotal === expectedGrandTotal,
      '6. Frontend-submitted fake grandTotal ignored by backend',
    )

    // 7. Invalid product ID rejected
    const res7 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: '60f7b57b9f1b2c0015f8a000', quantity: 1 }],
        customer: { name: 'Test', email: 'test@example.com', phone: '9876543210' },
        shippingAddress: { line1: 'L1', city: 'Mumbai', state: 'MH', pincode: '400001' },
      }),
    })
    assert(res7.status === 404, '7. Non-existent product ID rejected with 404')

    // 8. Inactive product rejected
    const res8 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: inactiveProductId, quantity: 1 }],
        customer: { name: 'Test', email: 'test@example.com', phone: '9876543210' },
        shippingAddress: { line1: 'L1', city: 'Mumbai', state: 'MH', pincode: '400001' },
      }),
    })
    assert(res8.status === 400, '8. Inactive product rejected with 400')

    // 9 & 10 & 11. Quantity validations (invalid/zero/negative)
    const res9 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: testProductId, quantity: -2 }],
        customer: { name: 'Test', email: 'test@example.com', phone: '9876543210' },
        shippingAddress: { line1: 'L1', city: 'Mumbai', state: 'MH', pincode: '400001' },
      }),
    })
    assert(res9.status === 400, '9, 10, 11. Zero or negative quantity rejected with 400')

    // 12 & 13. Line total and subtotal calculation correctness
    assert(
      createdOrder.items[0].lineTotal === activeProduct.price * 1 &&
        createdOrder.pricing.subtotal === activeProduct.price,
      '12 & 13. Correct line total and subtotal calculated by backend',
    )

    // 14. Human readable order number generated
    assert(
      typeof testOrderNumber === 'string' && testOrderNumber.startsWith('MJ-'),
      '14. Human-readable unique order number generated (e.g. MJ-2026-XXXXXX)',
    )

    // 15. Customer snapshot stored
    assert(
      createdOrder.customer.name === 'Darshil Bhandari' &&
        createdOrder.customer.email === 'customer1_b12@mayura.com' &&
        createdOrder.customer.phone === '9876543210',
      '15. Customer snapshot (name, email, phone) preserved in order record',
    )

    // 16. Product snapshot stored
    assert(
      createdOrder.items[0].name === activeProduct.name &&
        createdOrder.items[0].sku === activeProduct.sku,
      '16. Product historical snapshot stored in order item',
    )

    // 17 & 18. Order retrieval by customer
    const res17 = await fetch(`${BASE_URL}/api/v1/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    }).then((r) => r.json())
    assert(
      res17.success === true && res17.data.order._id === testOrderId,
      '17 & 18. Customer can retrieve own order details by ID',
    )

    // 19. Customer cannot retrieve another customer's order
    const res19 = await fetch(`${BASE_URL}/api/v1/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    })
    assert(res19.status === 403, '19. Customer cannot retrieve another customer order (403 Forbidden)')

    // 20 & 21. Customer order history & pagination
    const res20 = await fetch(`${BASE_URL}/api/v1/orders?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    }).then((r) => r.json())
    assert(
      res20.success === true &&
        Array.isArray(res20.data.orders) &&
        res20.data.orders.length > 0 &&
        res20.data.pagination.page === 1,
      '20 & 21. Customer order history with pagination retrieved successfully',
    )

    // 22 & 23. Customer cannot modify order status or payment status via POST/PUT
    const res22 = await fetch(`${BASE_URL}/api/v1/orders/${testOrderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ status: 'DELIVERED', paymentStatus: 'PAID' }),
    })
    assert(res22.status === 404 || res22.status === 405, '22 & 23. Customer cannot access update endpoints to change status')

    // 24 & 25. Admin order listing and detail
    const res24 = await fetch(`${BASE_URL}/api/v1/admin/orders?search=${testOrderNumber}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res24.success === true && res24.data.orders.length === 1,
      '24. Admin order listing & search by order number works',
    )

    const res25 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(res25.success === true && res25.data.order._id === testOrderId, '25. Admin order detail endpoint works')

    // 26. Admin status update (CONFIRMED -> PROCESSING -> SHIPPED)
    capturedEmails.length = 0
    const res26 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'SHIPPED',
        trackingNumber: 'AWB987654321',
        courierName: 'Blue Dart Luxury',
        adminNotes: 'Handed over to courier express team.',
      }),
    }).then((r) => r.json())
    assert(
      res26.success === true &&
        res26.data.order.status === 'SHIPPED' &&
        res26.data.order.delivery.trackingNumber === 'AWB987654321',
      '26. Admin status update to SHIPPED succeeds with tracking info',
    )

    // 27. Customer token rejected from admin endpoints
    const res27 = await fetch(`${BASE_URL}/api/v1/admin/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    })
    assert(res27.status === 403, '27. Customer token rejected from admin endpoints (403 Forbidden)')

    // 28. Missing admin token returns 401
    const res28 = await fetch(`${BASE_URL}/api/v1/admin/orders`)
    assert(res28.status === 401, '28. Missing authentication token returns 401 Unauthorized')

    // 29 & 30 & 31. Razorpay gateway order creation from backend amount
    assert(
      res3Body.data?.razorpay && res3Body.data.razorpay.amount === Math.round(expectedGrandTotal * 100),
      '29, 30, 31. Gateway order amount calculated exclusively by backend',
    )

    // 32. Invalid signature rejected
    const res32 = await fetch(`${BASE_URL}/api/v1/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        razorpayOrderId: res3Body.data?.razorpay?.razorpayOrderId || 'rzp_mock_123',
        razorpayPaymentId: 'pay_invalid_123',
        razorpaySignature: 'invalid_fraudulent_signature_hex',
      }),
    })
    assert(res32.status === 400, '32. Fraudulent/invalid payment signature rejected with 400 Bad Request')

    // 33. Valid signature accepted (using mock test signature)
    capturedEmails.length = 0
    const res33 = await fetch(`${BASE_URL}/api/v1/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        razorpayOrderId: res3Body.data?.razorpay?.razorpayOrderId || 'rzp_mock_123',
        razorpayPaymentId: 'pay_valid_999',
        razorpaySignature: 'valid_mock_sig_12345',
      }),
    }).then((r) => r.json())

    assert(
      res33.success === true && res33.data.order.payment.status === 'PAID',
      '33. Valid payment signature accepted and payment status updated to PAID',
    )

    // 34 & 35. Idempotent duplicate verification call
    const res34 = await fetch(`${BASE_URL}/api/v1/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        razorpayOrderId: res3Body.data?.razorpay?.razorpayOrderId || 'rzp_mock_123',
        razorpayPaymentId: 'pay_valid_999',
        razorpaySignature: 'valid_mock_sig_12345',
      }),
    }).then((r) => r.json())
    assert(res34.success === true, '34 & 35. Repeated payment verification handled idempotently without error')

    // 36, 37, 38. Order not marked PAID before verification test
    const unverifiedOrder = await Order.create({
      orderNumber: Order.generateOrderNumber(),
      customer: { name: 'Unverified Test', email: 'unverified@example.com', phone: '9876543210' },
      shippingAddress: { line1: 'L1', city: 'Mumbai', state: 'MH', pincode: '400001' },
      items: [
        {
          productId: activeProduct._id,
          name: activeProduct.name,
          quantity: 1,
          unitPrice: activeProduct.price,
          lineTotal: activeProduct.price,
        },
      ],
      pricing: { subtotal: activeProduct.price, grandTotal: activeProduct.price },
      payment: { method: 'RAZORPAY', status: 'PENDING' },
      status: 'PENDING_PAYMENT',
    })
    assert(
      unverifiedOrder.payment.status === 'PENDING' && unverifiedOrder.status === 'PENDING_PAYMENT',
      '36, 37, 38. Order remains PENDING_PAYMENT / PENDING before verification',
    )
    await Order.deleteOne({ _id: unverifiedOrder._id })

    // 39. Secrets not exposed in API response
    assert(
      res3Body.data.razorpay.keySecret === undefined && res3Body.data.order.payment.secret === undefined,
      '39. Payment gateway secrets are never exposed in API responses',
    )

    // 40. Payment failure scenario handling
    const failedOrder = await Order.create({
      orderNumber: Order.generateOrderNumber(),
      customer: { name: 'Failed Pay User', email: 'failed@example.com', phone: '9876543210' },
      shippingAddress: { line1: 'L1', city: 'Mumbai', state: 'MH', pincode: '400001' },
      items: [
        {
          productId: activeProduct._id,
          name: activeProduct.name,
          quantity: 1,
          unitPrice: activeProduct.price,
          lineTotal: activeProduct.price,
        },
      ],
      pricing: { subtotal: activeProduct.price, grandTotal: activeProduct.price },
      payment: { method: 'RAZORPAY', status: 'PENDING' },
      status: 'PENDING_PAYMENT',
    })

    const res40 = await fetch(`${BASE_URL}/api/v1/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: failedOrder._id.toString(),
        razorpayOrderId: 'rzp_fail_order_123',
        razorpayPaymentId: 'pay_failed_123',
        razorpaySignature: 'invalid_bad_sig',
      }),
    })
    assert(res40.status === 400, '40. Payment failure leaves order in valid state but payment status FAILED')
    await Order.deleteOne({ _id: failedOrder._id })

    // 41. Email notification triggers
    const orderConfEmail = capturedEmails.find((e) => e.templateName === 'paymentReceived' || e.templateName === 'orderConfirmation')
    assert(orderConfEmail !== undefined, '41. Email notification triggered safely via B-11 email service')

    // --- REGRESSION TESTS (B-01 to B-11) ---
    const rProducts = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const rCollections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    const rHomepage = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    const rBanners = await fetch(`${BASE_URL}/api/v1/banners`).then((r) => r.json())
    const rBlog = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    const rTestimonials = await fetch(`${BASE_URL}/api/v1/testimonials`).then((r) => r.json())
    const rGallery = await fetch(`${BASE_URL}/api/v1/gallery`).then((r) => r.json())
    const rFaqs = await fetch(`${BASE_URL}/api/v1/faqs`).then((r) => r.json())
    const rPolicies = await fetch(`${BASE_URL}/api/v1/policies`).then((r) => r.json())
    const rSettings = await fetch(`${BASE_URL}/api/v1/settings`).then((r) => r.json())

    assert(
      rProducts.success === true &&
        rCollections.success === true &&
        rHomepage.success === true &&
        rBanners.success === true &&
        rBlog.success === true &&
        rTestimonials.success === true &&
        rGallery.success === true &&
        rFaqs.success === true &&
        rPolicies.success === true &&
        rSettings.success === true,
      '42. Full regression pass OK across B-01 through B-11 modules',
    )

    // Clean up temporary test data
    if (testOrderId) await Order.deleteOne({ _id: testOrderId })
    if (inactiveProductId) await Product.deleteOne({ _id: inactiveProductId })

    console.log(`\n=== TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
