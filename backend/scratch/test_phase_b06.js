import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Banner from '../src/models/Banner.js'
import Media from '../src/models/Media.js'
import Product from '../src/models/Product.js'
import Collection from '../src/models/Collection.js'
import HomepageSection from '../src/models/HomepageSection.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5096
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testBannerId = ''
let testMediaId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-06 AUTOMATED API SUITE ===\n')

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
      name: 'Test Admin B06',
      email: 'admin_test_b06@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B06',
      email: 'customer_test_b06@mayura.com',
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

    // 2. Public banner listing
    const res2 = await fetch(`${BASE_URL}/api/v1/banners`).then((r) => r.json())
    assert(
      res2.success === true &&
        Array.isArray(res2.data.banners) &&
        res2.data.banners.length >= 5,
      '2. GET /api/v1/banners returns active banners',
    )

    // 3. Public banner placement filter
    const res3 = await fetch(`${BASE_URL}/api/v1/banners?placement=homepage-hero`).then((r) =>
      r.json(),
    )
    assert(
      res3.success === true &&
        res3.data.banners.length > 0 &&
        res3.data.banners.every((b) => b.placement === 'homepage-hero'),
      '3. GET /api/v1/banners?placement=homepage-hero returns only homepage-hero banners',
    )

    // 4. Public banner slug lookup
    const res4 = await fetch(`${BASE_URL}/api/v1/banners/hero-bridal-atelier`).then((r) =>
      r.json(),
    )
    assert(
      res4.success === true && res4.data.banner.slug === 'hero-bridal-atelier',
      '4. GET /api/v1/banners/hero-bridal-atelier returns single banner details',
    )

    // 5. Invalid banner slug lookup
    const res5Status = await fetch(`${BASE_URL}/api/v1/banners/invalid-banner-slug`).then(
      (r) => r.status,
    )
    assert(res5Status === 404, '5. GET /api/v1/banners/invalid-banner-slug returns 404')

    // 6. Banner seed count check
    const bannerCount = await Banner.countDocuments({
      slug: { $nin: ['b06-test-banner'] },
    })
    assert(
      bannerCount === 5,
      `6. Banner seed total count is exactly 5 (Actual: ${bannerCount})`,
    )

    // 7. Admin banner list
    const res7 = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res7.success === true && Array.isArray(res7.data.banners),
      '7. GET /api/v1/admin/banners with ADMIN token returns list of banners',
    )

    // 8. Admin create banner
    const testBannerPayload = {
      title: 'B06 Test Banner',
      slug: 'b06-test-banner',
      placement: 'homepage-promo',
      eyebrow: 'Test Eyebrow',
      headline: 'Test Headline',
      desktopImage: '/images/editorial/mayura-hero-04.jpg',
      cta: { label: 'Test CTA', href: '/collections/all', target: '_self' },
      displayOrder: 999,
      isActive: true,
    }
    const res8 = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testBannerPayload),
    })
    const res8Body = await res8.json()
    assert(
      res8.status === 201 && res8Body.success === true,
      '8. POST /api/v1/admin/banners with ADMIN token returns 201 Created',
    )
    if (res8Body.data?.banner?._id) {
      testBannerId = res8Body.data.banner._id
    }

    // 9. Duplicate banner slug rejection
    const res9 = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testBannerPayload),
    })
    assert(
      res9.status === 409,
      '9. POST /api/v1/admin/banners with duplicate slug returns 409 Conflict',
    )

    // 10. Unsafe URL scheme rejection
    const res10 = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...testBannerPayload,
        slug: 'b06-unsafe-url-test',
        desktopImage: 'javascript:alert(1)',
      }),
    })
    assert(
      res10.status === 400,
      '10. POST /api/v1/admin/banners with javascript: URL scheme returns 400 Bad Request',
    )

    // 11. Invalid date scheduling rejection
    const res11 = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        ...testBannerPayload,
        slug: 'b06-invalid-date-test',
        startAt: new Date('2026-12-01'),
        endAt: new Date('2026-01-01'),
      }),
    })
    assert(
      res11.status === 400,
      '11. POST /api/v1/admin/banners with endAt earlier than startAt returns 400 Bad Request',
    )

    // 12. Admin get banner by ID/slug
    const res12 = await fetch(
      `${BASE_URL}/api/v1/admin/banners/b06-test-banner`,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    ).then((r) => r.json())
    assert(
      res12.success === true && res12.data.banner.slug === 'b06-test-banner',
      '12. GET /api/v1/admin/banners/:id returns single banner by slug',
    )

    // 13. Admin update banner
    const res13 = await fetch(`${BASE_URL}/api/v1/admin/banners/${testBannerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ headline: 'Updated Test Headline' }),
    })
    const res13Body = await res13.json()
    assert(
      res13.status === 200 && res13Body.data.banner.headline === 'Updated Test Headline',
      '13. PUT /api/v1/admin/banners/:id updates headline to "Updated Test Headline"',
    )

    // 14. Admin deactivate banner
    const res14 = await fetch(`${BASE_URL}/api/v1/admin/banners/${testBannerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const res14Body = await res14.json()
    assert(
      res14.status === 200 && res14Body.data.banner.isActive === false,
      '14. DELETE /api/v1/admin/banners/:id soft deactivates banner (isActive: false)',
    )

    // 15. Public banner API hides inactive banner
    const res15Status = await fetch(`${BASE_URL}/api/v1/banners/b06-test-banner`).then(
      (r) => r.status,
    )
    assert(
      res15Status === 404,
      '15. Deactivated banner is hidden (404) from public GET /api/v1/banners/:slug',
    )

    // 16. Admin media creation
    const testMediaPayload = {
      name: 'B06 Test Media',
      publicId: 'b06-test-media',
      url: '/images/hero/mayura-hero-01.jpg',
      provider: 'local',
      resourceType: 'image',
      altText: 'B06 test media alt text',
      folder: 'banners',
    }
    const res16 = await fetch(`${BASE_URL}/api/v1/admin/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testMediaPayload),
    })
    const res16Body = await res16.json()
    assert(
      res16.status === 201 && res16Body.success === true,
      '16. POST /api/v1/admin/media with ADMIN token returns 201 Created',
    )
    if (res16Body.data?.media?._id) {
      testMediaId = res16Body.data.media._id
    }

    // 17. Admin media list
    const res17 = await fetch(`${BASE_URL}/api/v1/admin/media`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res17.success === true && Array.isArray(res17.data.media),
      '17. GET /api/v1/admin/media with ADMIN token returns paginated media list',
    )

    // 18. Customer cannot mutate banner/media
    const res18Banner = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ title: 'Cust Ban', slug: 'cust-ban', placement: 'homepage-hero', desktopImage: '/img.jpg' }),
    })
    const res18Media = await fetch(`${BASE_URL}/api/v1/admin/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: 'Cust Med', publicId: 'cust-med', url: '/img.jpg' }),
    })
    assert(
      res18Banner.status === 403 && res18Media.status === 403,
      '18. POST /api/v1/admin/banners & /media with CUSTOMER token returns 403 Forbidden',
    )

    // 19. No-token admin request
    const res19 = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'No Token', slug: 'no-token', placement: 'homepage-hero', desktopImage: '/img.jpg' }),
    })
    assert(
      res19.status === 401,
      '19. POST /api/v1/admin/banners without token returns 401 Unauthorized',
    )

    // 20. B-01 to B-05 Regression check
    const res20Health = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    const res20Products = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const res20Collections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    const res20Homepage = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    assert(
      res20Health.success === true &&
        res20Products.success === true &&
        res20Collections.success === true &&
        res20Homepage.success === true,
      '20. B-01, B-02, B-03, B-04, and B-05 endpoints pass regression check OK',
    )

    // Clean up test data
    await Banner.deleteOne({ _id: testBannerId })
    await Media.deleteOne({ _id: testMediaId })

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
