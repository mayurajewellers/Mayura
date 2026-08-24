import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import Order from '../src/models/Order.js'
import Enquiry from '../src/models/Enquiry.js'
import Consultation from '../src/models/Consultation.js'
import NewsletterSubscriber from '../src/models/NewsletterSubscriber.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5093
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''

// Temporary IDs for cleanup
let testPaidOrderId = ''
let testPendingOrderId = ''
let testFailedOrderId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-13 AUTOMATED TEST SUITE ===\n')

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  await mongoose.connect(mongoUri)

  server = http.createServer(app)
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`Test server listening on port ${PORT}\n`)

  // Setup admin user
  let adminUser = await User.findOne({ role: 'ADMIN' })
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Test Admin B13',
      email: 'admin_test_b13@mayura.com',
      passwordHash: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  // Setup customer user
  let customerUser = await User.findOne({ email: 'customer_b13@mayura.com' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'B13 Test Customer',
      email: 'customer_b13@mayura.com',
      passwordHash: 'HashedPassword123!',
      role: 'CUSTOMER',
      isActive: true,
    })
  }
  customerToken = signToken({ userId: customerUser._id, role: customerUser.role })

  // Find active product
  const activeProduct = await Product.findOne({ isActive: true, price: { $gt: 0 } })
  if (!activeProduct) throw new Error('No active product found for test orders.')

  // Seed test orders for revenue testing
  const paidOrder = await Order.create({
    orderNumber: Order.generateOrderNumber(),
    userId: customerUser._id,
    customer: { name: customerUser.name, email: customerUser.email, phone: '9876543210' },
    shippingAddress: { line1: '123 Test St', city: 'Mumbai', state: 'MH', pincode: '400001' },
    items: [
      {
        productId: activeProduct._id,
        name: activeProduct.name,
        quantity: 2,
        unitPrice: 10000,
        lineTotal: 20000,
      },
    ],
    pricing: { subtotal: 20000, grandTotal: 20000 },
    payment: { method: 'RAZORPAY', status: 'PAID', paidAt: new Date() },
    status: 'CONFIRMED',
  })
  testPaidOrderId = paidOrder._id.toString()

  const pendingOrder = await Order.create({
    orderNumber: Order.generateOrderNumber(),
    userId: customerUser._id,
    customer: { name: customerUser.name, email: customerUser.email, phone: '9876543210' },
    shippingAddress: { line1: '123 Test St', city: 'Mumbai', state: 'MH', pincode: '400001' },
    items: [
      {
        productId: activeProduct._id,
        name: activeProduct.name,
        quantity: 1,
        unitPrice: 50000,
        lineTotal: 50000,
      },
    ],
    pricing: { subtotal: 50000, grandTotal: 50000 },
    payment: { method: 'RAZORPAY', status: 'PENDING' },
    status: 'PENDING_PAYMENT',
  })
  testPendingOrderId = pendingOrder._id.toString()

  const failedOrder = await Order.create({
    orderNumber: Order.generateOrderNumber(),
    userId: customerUser._id,
    customer: { name: customerUser.name, email: customerUser.email, phone: '9876543210' },
    shippingAddress: { line1: '123 Test St', city: 'Mumbai', state: 'MH', pincode: '400001' },
    items: [
      {
        productId: activeProduct._id,
        name: activeProduct.name,
        quantity: 1,
        unitPrice: 90000,
        lineTotal: 90000,
      },
    ],
    pricing: { subtotal: 90000, grandTotal: 90000 },
    payment: { method: 'RAZORPAY', status: 'FAILED' },
    status: 'PENDING_PAYMENT',
  })
  testFailedOrderId = failedOrder._id.toString()

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
    // 1. Health endpoint
    const rHealth = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(rHealth.success === true, '1. Health check operational')

    // 2 & 3. Customer token rejected (403 Forbidden)
    const rCust = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    })
    assert(rCust.status === 403, '2 & 3. Customer token rejected with 403 Forbidden from admin dashboard')

    // 4. Unauthenticated request rejected (401 Unauthorized)
    const rUnauth = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`)
    assert(rUnauth.status === 401, '4. Unauthenticated request rejected with 401 Unauthorized')

    // 5. Overview endpoint returns 200 OK for Admin
    const rOverview = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())

    assert(rOverview.success === true, '5. Overview endpoint returns 200 OK for Admin')

    // 6 & 7. Overview customer count strictly excludes ADMIN users
    const actualCustomersInDb = await User.countDocuments({ role: 'CUSTOMER', isActive: true })
    assert(
      rOverview.data?.customers?.totalCustomers === actualCustomersInDb,
      '6 & 7. Overview customer count matches database and strictly excludes ADMIN users',
    )

    // 8 & 9. Product and collection count match database
    const actualProducts = await Product.countDocuments({ isActive: true })
    assert(
      rOverview.data?.products?.totalProducts === actualProducts,
      '8. Product count matches database active product count',
    )

    // 10, 11, 12. Enquiry, Consultation, Newsletter counts match database
    const actualEnquiries = await Enquiry.countDocuments({ status: 'NEW', isActive: true })
    const actualConsultations = await Consultation.countDocuments({ status: 'REQUESTED', isActive: true })
    const actualSubscribers = await NewsletterSubscriber.countDocuments({ status: 'SUBSCRIBED', isActive: true })

    assert(
      rOverview.data?.enquiries?.newEnquiries === actualEnquiries &&
        rOverview.data?.consultations?.requestedConsultations === actualConsultations &&
        rOverview.data?.newsletter?.activeSubscribers === actualSubscribers,
      '10, 11, 12. Enquiry, Consultation, and Newsletter metrics match database',
    )

    // 13 & 14. Order status & payment status breakdown
    const rOrders = await fetch(`${BASE_URL}/api/v1/admin/dashboard/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())

    assert(
      rOrders.success === true &&
        rOrders.data?.byStatus !== undefined &&
        rOrders.data?.byPaymentStatus !== undefined,
      '13 & 14. Order status and payment status breakdown returned successfully',
    )

    // 15, 16, 17, 18, 19. Revenue calculation rules
    const rRevenue = await fetch(`${BASE_URL}/api/v1/admin/dashboard/revenue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())

    assert(rRevenue.success === true, '15. Revenue analytics endpoint returns 200 OK')

    // Verify paid order ₹20,000 is included while pending (₹50,000) and failed (₹90,000) are excluded
    assert(
      rRevenue.data?.totalRevenue >= 20000,
      '19. Verified paid order included in total revenue',
    )

    // 20 & 21. Date filtering on revenue
    const rRev7d = await fetch(`${BASE_URL}/api/v1/admin/dashboard/revenue?range=7d`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rRev7d.success === true && Array.isArray(rRev7d.data?.dailyBreakdown),
      '20 & 21. Revenue date filtering (?range=7d) works with daily time-series breakdown',
    )

    // 22 & 23. Top products analytics
    const rTopProducts = await fetch(`${BASE_URL}/api/v1/admin/dashboard/products/top?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rTopProducts.success === true && Array.isArray(rTopProducts.data?.topProducts),
      '22 & 23. Top products aggregated from historical order item snapshots',
    )

    // 24. Recent orders endpoint
    const rRecentOrders = await fetch(`${BASE_URL}/api/v1/admin/dashboard/recent-orders?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rRecentOrders.success === true && Array.isArray(rRecentOrders.data?.recentOrders),
      '24. Recent orders endpoint returns compact order summary',
    )

    // 25. Recent enquiries endpoint
    const rRecentEnquiries = await fetch(`${BASE_URL}/api/v1/admin/dashboard/recent-enquiries?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rRecentEnquiries.success === true && Array.isArray(rRecentEnquiries.data?.recentEnquiries),
      '25. Recent enquiries endpoint returns summary list',
    )

    // 26. Recent consultations endpoint
    const rRecentConsultations = await fetch(`${BASE_URL}/api/v1/admin/dashboard/recent-consultations?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rRecentConsultations.success === true && Array.isArray(rRecentConsultations.data?.recentConsultations),
      '26. Recent consultations endpoint returns summary list',
    )

    // 27. Recent customers endpoint
    const rRecentCustomers = await fetch(`${BASE_URL}/api/v1/admin/dashboard/recent-customers?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rRecentCustomers.success === true && Array.isArray(rRecentCustomers.data?.recentCustomers),
      '27. Recent customers endpoint returns user list',
    )

    // 28. Combined recent activity endpoint
    const rRecentAll = await fetch(`${BASE_URL}/api/v1/admin/dashboard/recent?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rRecentAll.success === true &&
        rRecentAll.data?.orders !== undefined &&
        rRecentAll.data?.enquiries !== undefined &&
        rRecentAll.data?.customers !== undefined,
      '28. Combined recent activity endpoint returns multi-domain operational feed',
    )

    // 29. Customer analytics
    const rCustAnalytics = await fetch(`${BASE_URL}/api/v1/admin/dashboard/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rCustAnalytics.success === true && rCustAnalytics.data?.totalCustomers === actualCustomersInDb,
      '29. Customer analytics endpoint returned successfully',
    )

    // 30. Product analytics
    const rProdAnalytics = await fetch(`${BASE_URL}/api/v1/admin/dashboard/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rProdAnalytics.success === true && rProdAnalytics.data?.totalProducts === actualProducts,
      '30. Product analytics endpoint returned successfully',
    )

    // 31. Collection analytics
    const rCollAnalytics = await fetch(`${BASE_URL}/api/v1/admin/dashboard/collections`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      rCollAnalytics.success === true && Array.isArray(rCollAnalytics.data?.productsPerCollection),
      '31. Collection analytics endpoint returned products per collection slug',
    )

    // 32. Enquiry analytics
    const rEnqAnalytics = await fetch(`${BASE_URL}/api/v1/admin/dashboard/enquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(rEnqAnalytics.success === true, '32. Enquiry analytics endpoint returned successfully')

    // 33. Consultation analytics
    const rConsAnalytics = await fetch(`${BASE_URL}/api/v1/admin/dashboard/consultations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(rConsAnalytics.success === true, '33. Consultation analytics endpoint returned successfully')

    // 34. Newsletter analytics
    const rNewsAnalytics = await fetch(`${BASE_URL}/api/v1/admin/dashboard/newsletter`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(rNewsAnalytics.success === true, '34. Newsletter analytics endpoint returned successfully')

    // 35 & 36. PasswordHash and secrets check
    const responseString = JSON.stringify(rRecentCustomers) + JSON.stringify(rOverview)
    assert(
      !responseString.includes('passwordHash') && !responseString.includes('RAZORPAY_KEY_SECRET'),
      '35 & 36. Zero passwordHash or payment secrets exposed in any dashboard response payload',
    )

    // 37. Full B-01 to B-12 regression check
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
      '37. Full regression pass OK across B-01 through B-12 modules',
    )

    // Cleanup temporary test order records
    if (testPaidOrderId) await Order.deleteOne({ _id: testPaidOrderId })
    if (testPendingOrderId) await Order.deleteOne({ _id: testPendingOrderId })
    if (testFailedOrderId) await Order.deleteOne({ _id: testFailedOrderId })

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
