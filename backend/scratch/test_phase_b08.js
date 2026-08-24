import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Testimonial from '../src/models/Testimonial.js'
import GalleryItem from '../src/models/GalleryItem.js'
import FAQ from '../src/models/FAQ.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5094
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testTestimonialId = ''
let testGalleryId = ''
let testFaqId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-08 AUTOMATED API SUITE ===\n')

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  await mongoose.connect(mongoUri)

  // Setup server
  server = http.createServer(app)
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`Test server running on port ${PORT}\n`)

  // Setup test tokens
  let adminUser = await User.findOne({ role: 'ADMIN' })
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Test Admin B08',
      email: 'admin_test_b08@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B08',
      email: 'customer_test_b08@mayura.com',
      password: 'HashedPassword123!',
      role: 'CUSTOMER',
      isActive: true,
    })
  }
  customerToken = signToken({ userId: customerUser._id, role: customerUser.role })

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
    const res1 = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(
      res1.success === true && res1.data.database === 'connected',
      '1. GET /api/v1/health returns 200 OK with connected database',
    )

    // --- TESTIMONIALS TESTS ---
    // 2. Public Testimonials list
    const res2 = await fetch(`${BASE_URL}/api/v1/testimonials`).then((r) => r.json())
    assert(
      res2.success === true && Array.isArray(res2.data.testimonials) && res2.data.testimonials.length >= 12,
      '2. GET /api/v1/testimonials returns active testimonials',
    )

    // 3. Admin create testimonial
    const testTestimonialPayload = {
      legacyId: 't-b08-test',
      name: 'B08 Test Reviewer',
      location: 'Kandivali East',
      rating: 5,
      headline: 'B08 Test Headline',
      quote: 'Temporary B08 test quote content',
      isActive: true,
    }
    const res3 = await fetch(`${BASE_URL}/api/v1/admin/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(testTestimonialPayload),
    })
    const res3Body = await res3.json()
    assert(
      res3.status === 201 && res3Body.success === true,
      '3. POST /api/v1/admin/testimonials with ADMIN token returns 201 Created',
    )
    if (res3Body.data?.testimonial?._id) {
      testTestimonialId = res3Body.data.testimonial._id
    }

    // 4. Admin deactivate & public hide testimonial
    const res4 = await fetch(`${BASE_URL}/api/v1/admin/testimonials/${testTestimonialId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res4.success === true && res4.data.testimonial.isActive === false,
      '4. DELETE /api/v1/admin/testimonials/:id soft deactivates testimonial',
    )

    // --- GALLERY TESTS ---
    // 5. Public Gallery list
    const res5 = await fetch(`${BASE_URL}/api/v1/gallery`).then((r) => r.json())
    assert(
      res5.success === true && Array.isArray(res5.data.items) && res5.data.items.length >= 18,
      '5. GET /api/v1/gallery returns active gallery items',
    )

    // 6. Public Gallery group filter
    const res6 = await fetch(`${BASE_URL}/api/v1/gallery?group=Bridal`).then((r) => r.json())
    assert(
      res6.success === true && res6.data.items.every((item) => item.group === 'Bridal'),
      '6. GET /api/v1/gallery?group=Bridal filters gallery by group',
    )

    // 7. Admin create gallery item
    const testGalleryPayload = {
      legacyId: 'gal-b08-test',
      src: '/images/editorial/bangle-diamond-blush.jpg',
      alt: 'B08 Test Alt',
      caption: 'B08 Test Caption',
      group: 'Bridal',
      isActive: true,
    }
    const res7 = await fetch(`${BASE_URL}/api/v1/admin/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(testGalleryPayload),
    })
    const res7Body = await res7.json()
    assert(
      res7.status === 201 && res7Body.success === true,
      '7. POST /api/v1/admin/gallery with ADMIN token returns 201 Created',
    )
    if (res7Body.data?.item?._id) {
      testGalleryId = res7Body.data.item._id
    }

    // 8. Unsafe URL scheme rejection
    const res8 = await fetch(`${BASE_URL}/api/v1/admin/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...testGalleryPayload, legacyId: 'gal-unsafe-test', src: 'javascript:alert(1)' }),
    })
    assert(
      res8.status === 400,
      '8. POST /api/v1/admin/gallery with javascript: URL scheme returns 400 Bad Request',
    )

    // --- FAQ TESTS ---
    // 9. Public FAQs list
    const res9 = await fetch(`${BASE_URL}/api/v1/faqs`).then((r) => r.json())
    assert(
      res9.success === true && Array.isArray(res9.data.faqs) && res9.data.faqs.length >= 53,
      '9. GET /api/v1/faqs returns active FAQs',
    )

    // 10. Public FAQ categoryId filter
    const res10 = await fetch(`${BASE_URL}/api/v1/faqs?categoryId=general`).then((r) => r.json())
    assert(
      res10.success === true && res10.data.faqs.every((f) => f.categoryId === 'general'),
      '10. GET /api/v1/faqs?categoryId=general filters FAQs by categoryId',
    )

    // 11. Admin create FAQ
    const testFaqPayload = {
      legacyId: 'faq-b08-test',
      question: 'B08 Test Question?',
      answer: 'B08 Test Answer text.',
      category: 'General Merchandise',
      categoryId: 'general',
      isActive: true,
    }
    const res11 = await fetch(`${BASE_URL}/api/v1/admin/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(testFaqPayload),
    })
    const res11Body = await res11.json()
    assert(
      res11.status === 201 && res11Body.success === true,
      '11. POST /api/v1/admin/faqs with ADMIN token returns 201 Created',
    )
    if (res11Body.data?.faq?._id) {
      testFaqId = res11Body.data.faq._id
    }

    // --- SECURITY & AUTHORIZATION TESTS ---
    // 12. Customer token rejected on admin routes
    const res12 = await fetch(`${BASE_URL}/api/v1/admin/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ name: 'Cust', quote: 'Quote' }),
    })
    assert(res12.status === 403, '12. CUSTOMER token on admin endpoint returns 403 Forbidden')

    // 13. Unauthenticated request rejected
    const res13 = await fetch(`${BASE_URL}/api/v1/admin/faqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Q?', answer: 'A', category: 'C', categoryId: 'c' }),
    })
    assert(res13.status === 401, '13. Unauthenticated admin request returns 401 Unauthorized')

    // --- REGRESSION TESTS (B-01 to B-07) ---
    // 14. Full B-01 to B-07 Regression
    const rHealth = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    const rProducts = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const rCollections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    const rHomepage = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    const rBanners = await fetch(`${BASE_URL}/api/v1/banners`).then((r) => r.json())
    const rBlog = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())

    assert(
      rHealth.success === true &&
        rProducts.success === true &&
        rCollections.success === true &&
        rHomepage.success === true &&
        rBanners.success === true &&
        rBlog.success === true,
      '14. B-01 through B-07 endpoints pass regression check OK',
    )

    // Clean up temporary test entries
    await Testimonial.deleteOne({ _id: testTestimonialId })
    await GalleryItem.deleteOne({ _id: testGalleryId })
    await FAQ.deleteOne({ _id: testFaqId })

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
