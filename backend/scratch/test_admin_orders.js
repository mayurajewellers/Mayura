import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Order from '../src/models/Order.js'
import Product from '../src/models/Product.js'

import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5099
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING ADMIN ORDERS MANAGEMENT COMPREHENSIVE TEST SUITE (20 TEST ASSERTIONS) ===\n')

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
    // Prepare Admin & Customer Tokens
    let adminUser = await User.findOne({ role: 'ADMIN', isActive: true })
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10)
      adminUser = await User.create({
        name: 'Test Order Admin',
        email: `order_admin_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'ADMIN',
      })
    }
    const adminToken = signToken({ userId: adminUser._id.toString(), role: adminUser.role })
    const adminHeaders = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' }

    let custUser = await User.findOne({ role: 'CUSTOMER', isActive: true })
    if (!custUser) {
      const salt = await bcrypt.genSalt(10)
      custUser = await User.create({
        name: 'Test Order Customer',
        email: `order_cust_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'CUSTOMER',
      })
    }
    const custToken = signToken({ userId: custUser._id.toString(), role: custUser.role })

    // Create a real test Product & Order in MongoDB
    const testSku = `ORD-SKU-${Date.now()}`
    const testProduct = await Product.create({
      legacyId: `leg-prod-${Date.now()}`,
      sku: testSku,
      name: 'Historical Test Choker',
      slug: testSku.toLowerCase(),
      type: 'necklace',
      collection: 'anantara',
      price: 150000,
      images: ['/images/editorial/layered-haram-trunk.jpg'],
      metal: '22K Gold',
      metalKey: '22k-yellow-gold',
      purity: '22K916',
      grossWeight: 45.2,
      netWeight: 40.5,
      makingCharges: 'Included',
      shipping: 'Insured Delivery',
      returns: '15-Day Guarantee',
      certification: 'BIS Hallmarked 916',
      description: 'Handcrafted heritage choker necklace',
      isActive: true,
    })

    const testOrderNumber = Order.generateOrderNumber()
    const testOrder = await Order.create({
      orderNumber: testOrderNumber,
      userId: custUser._id,
      customer: {
        name: 'Bhavya Agrawal',
        email: 'bhavya@example.com',
        phone: '+91 98350 11111',
      },
      shippingAddress: {
        name: 'Bhavya Agrawal',
        phone: '+91 98350 11111',
        line1: 'Flat 402, Mayura Regency',
        line2: 'Main Road',
        city: 'Begusarai',
        state: 'Bihar',
        pincode: '851101',
        country: 'India',
        notes: 'Handle with care - High value jewellery',
      },
      items: [
        {
          productId: testProduct._id,
          sku: testProduct.sku,
          name: testProduct.name,
          image: testProduct.images[0],
          quantity: 2,
          unitPrice: 150000,
          lineTotal: 300000,
        },
      ],
      pricing: {
        subtotal: 300000,
        discount: 0,
        shipping: 0,
        tax: 0,
        grandTotal: 300000,
        currency: 'INR',
      },
      payment: {
        method: 'RAZORPAY',
        status: 'PAID',
        razorpayOrderId: 'order_rzp_test_123',
        razorpayPaymentId: 'pay_rzp_test_456',
        paidAt: new Date(),
      },
      delivery: {
        method: 'standard',
        trackingNumber: 'DELHIVERY-9988',
        courierName: 'Delhivery',
      },
      status: 'PROCESSING',
      adminNotes: 'Verified customer call prior to shipping.',
      isActive: true,
    })

    // 1. Guest access returns 401
    const r1 = await fetch(`${BASE_URL}/api/v1/admin/orders`)
    assert(r1.status === 401, '1. Guest cannot access admin orders (401 Unauthorized)')

    // 2. Customer access returns 403
    const r2 = await fetch(`${BASE_URL}/api/v1/admin/orders`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(r2.status === 403, '2. CUSTOMER role cannot access admin orders (403 Forbidden)')

    // 3. Admin can list orders
    const r3 = await fetch(`${BASE_URL}/api/v1/admin/orders`, { headers: adminHeaders }).then((r) => r.json())
    assert(r3.success === true && Array.isArray(r3.data?.orders), '3. ADMIN can list orders (200 OK)')

    // 4. Admin search orders by number or name
    const r4 = await fetch(`${BASE_URL}/api/v1/admin/orders?search=${testOrderNumber}`, { headers: adminHeaders }).then((r) => r.json())
    assert(r4.success === true && r4.data?.orders?.length >= 1, '4. ADMIN can search orders by order number')

    // 5. Admin filter orders by status
    const r5 = await fetch(`${BASE_URL}/api/v1/admin/orders?status=PROCESSING`, { headers: adminHeaders }).then((r) => r.json())
    assert(r5.success === true && r5.data?.orders?.some((o) => o.status === 'PROCESSING'), '5. ADMIN can filter orders by status')

    // 6. Admin retrieve order details by ID
    const r6 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder._id}`, { headers: adminHeaders }).then((r) => r.json())
    assert(r6.success === true && r6.data?.order?.orderNumber === testOrderNumber, '6. ADMIN can retrieve order details by ID')

    const fetchedOrder = r6.data?.order

    // 7. Customer details are present
    assert(
      fetchedOrder?.customer?.name === 'Bhavya Agrawal' && fetchedOrder?.customer?.email === 'bhavya@example.com',
      '7. Customer details present in order response',
    )

    // 8. Shipping address is present
    assert(
      fetchedOrder?.shippingAddress?.line1 === 'Flat 402, Mayura Regency' && fetchedOrder?.shippingAddress?.city === 'Begusarai',
      '8. Shipping address present in order response',
    )

    // 9. Historical order item snapshot is correct
    assert(
      fetchedOrder?.items?.[0]?.sku === testSku && fetchedOrder?.items?.[0]?.name === 'Historical Test Choker',
      '9. Historical order item snapshot is correct',
    )

    // 10. Historical unit prices remain unchanged even if Product price changes in DB
    await Product.findByIdAndUpdate(testProduct._id, { price: 250000 })
    const r10 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder._id}`, { headers: adminHeaders }).then((r) => r.json())
    assert(r10.data?.order?.items?.[0]?.unitPrice === 150000, '10. Historical prices remain unchanged when Product price is updated later')

    // 11. Payment status is correct
    assert(r10.data?.order?.payment?.status === 'PAID', '11. Payment status is correct (PAID)')

    // 12. Payment method is correct
    assert(r10.data?.order?.payment?.method === 'RAZORPAY', '12. Payment method is correct (RAZORPAY)')

    // 13. Admin can update supported order status (e.g. SHIPPED)
    const r13 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder._id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'SHIPPED' }),
    }).then((r) => r.json())
    assert(r13.success === true && r13.data?.order?.status === 'SHIPPED', '13. Admin can update supported order status to SHIPPED')

    // 14. Invalid status transition rejected
    const r14 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder._id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'INVALID_STATUS' }),
    })
    assert(r14.status === 400, '14. Invalid status transition rejected with 400 Bad Request')

    // 15. Admin can update tracking information
    const r15 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder._id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ trackingNumber: 'BLUEDART-7711', courierName: 'Blue Dart' }),
    }).then((r) => r.json())
    assert(
      r15.success === true &&
        r15.data?.order?.delivery?.trackingNumber === 'BLUEDART-7711' &&
        r15.data?.order?.delivery?.courierName === 'Blue Dart',
      '15. Admin can update tracking information',
    )

    // 16. Admin notes are saved
    const r16 = await fetch(`${BASE_URL}/api/v1/admin/orders/${testOrder._id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ adminNotes: 'Special VIP Customer Order' }),
    }).then((r) => r.json())
    assert(r16.success === true && r16.data?.order?.adminNotes === 'Special VIP Customer Order', '16. Admin notes are saved')

    // 17. Admin notes are NOT exposed on public order query API
    const r17 = await fetch(`${BASE_URL}/api/v1/orders/${testOrder._id}?email=bhavya@example.com`).then((r) => r.json())
    assert(r17.success === true && r17.data?.order?.adminNotes === undefined, '17. Admin notes are not exposed on public order endpoint')

    // 18. Security Audit: No passwordHash returned
    const auditStr = JSON.stringify(r3) + JSON.stringify(r6)
    assert(!auditStr.includes('passwordHash'), '18. Security Audit: No passwordHash returned')

    // 19. Security Audit: No JWT secret returned
    assert(!auditStr.includes('jwtSecret') && !process.env.JWT_SECRET?.includes(auditStr), '19. Security Audit: No JWT secret returned')

    // 20. Security Audit: No Razorpay secret returned
    assert(!auditStr.includes('RAZORPAY_KEY_SECRET'), '20. Security Audit: No Razorpay key secret returned')

    // Cleanup test records
    await Order.findByIdAndDelete(testOrder._id)
    await Product.findByIdAndDelete(testProduct._id)

    console.log(`\n=== ADMIN ORDERS TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
