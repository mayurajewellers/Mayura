import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Collection from '../src/models/Collection.js'
import Product from '../src/models/Product.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5098
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testCollectionId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-04 AUTOMATED API SUITE ===\n')

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
      name: 'Test Admin B04',
      email: 'admin_test_b04@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B04',
      email: 'customer_test_b04@mayura.com',
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

    // 2 & 3. Collection Seed count check
    const collectionCount = await Collection.countDocuments({
      slug: { $nin: ['b04-test-collection'] },
    })
    assert(
      collectionCount === 6,
      `2 & 3. Collection seed total count is exactly 6 (Actual: ${collectionCount})`,
    )

    // 4. Public collection list
    const res4 = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    assert(
      res4.success === true &&
        Array.isArray(res4.data.collections) &&
        res4.data.collections.length >= 6,
      '4. GET /api/v1/collections returns list of active collections',
    )

    // 5. Public collection slug
    const res5 = await fetch(`${BASE_URL}/api/v1/collections/anantara`).then((r) => r.json())
    assert(
      res5.success === true && res5.data.collection.slug === 'anantara',
      '5. GET /api/v1/collections/anantara returns collection detail',
    )

    // 6. Invalid collection slug
    const res6Status = await fetch(`${BASE_URL}/api/v1/collections/invalid-collection-slug`).then(
      (r) => r.status,
    )
    assert(res6Status === 404, '6. GET /api/v1/collections/invalid-slug returns 404')

    // 7. Admin collection list
    const res7 = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res7.success === true && Array.isArray(res7.data.collections),
      '7. GET /api/v1/admin/collections with ADMIN token returns list',
    )

    // 8. Admin create collection
    const testCollectionPayload = {
      legacyId: 'COL-TEST-B04',
      name: 'B04 Test Collection',
      slug: 'b04-test-collection',
      meaning: 'test meaning',
      kicker: 'Test Kicker',
      tagline: 'Test Tagline',
      intro: 'Test intro text for B04 verification',
      story: 'Test story text for B04 verification',
      heroImage: '/images/test-hero.jpg',
      coverImage: '/images/test-cover.jpg',
      detailImage: '/images/test-detail.jpg',
      pieces: 'Rings · Earrings',
      palette: 'gold',
      displayOrder: 999,
      isActive: true,
      isFeatured: false,
    }
    const res8 = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testCollectionPayload),
    })
    const res8Body = await res8.json()
    assert(
      res8.status === 201 && res8Body.success === true,
      '8. POST /api/v1/admin/collections with ADMIN token returns 201',
    )
    if (res8Body.data?.collection?._id) {
      testCollectionId = res8Body.data.collection._id
    }

    // 9. Duplicate slug rejection
    const res9 = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ...testCollectionPayload, legacyId: 'COL-TEST-DIFFERENT' }),
    })
    assert(
      res9.status === 409,
      '9. POST /api/v1/admin/collections with duplicate slug returns 409 Conflict',
    )

    // 10. Admin update collection
    const res10 = await fetch(`${BASE_URL}/api/v1/admin/collections/${testCollectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ tagline: 'Updated Test Tagline', displayOrder: 1000 }),
    })
    const res10Body = await res10.json()
    assert(
      res10.status === 200 && res10Body.data.collection.tagline === 'Updated Test Tagline',
      '10. PUT /api/v1/admin/collections/:id updates tagline to "Updated Test Tagline"',
    )

    // 11. Admin deactivate (soft-delete) collection
    const res11 = await fetch(`${BASE_URL}/api/v1/admin/collections/${testCollectionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const res11Body = await res11.json()
    assert(
      res11.status === 200 && res11Body.data.collection.isActive === false,
      '11. DELETE /api/v1/admin/collections/:id deactivates collection (isActive: false)',
    )

    // 12. Public inactive collection hidden
    const res12Status = await fetch(`${BASE_URL}/api/v1/collections/b04-test-collection`).then(
      (r) => r.status,
    )
    assert(
      res12Status === 404,
      '12. Deactivated collection is hidden (404) from public GET /api/v1/collections/:slug',
    )

    // 13. Admin reactivation
    const res13 = await fetch(`${BASE_URL}/api/v1/admin/collections/${testCollectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isActive: true }),
    })
    const res13Body = await res13.json()
    assert(
      res13.status === 200 && res13Body.data.collection.isActive === true,
      '13. ADMIN can reactivate collection (isActive: true)',
    )
    const res13PublicStatus = await fetch(
      `${BASE_URL}/api/v1/collections/b04-test-collection`,
    ).then((r) => r.status)
    assert(
      res13PublicStatus === 200,
      '13b. Public GET /api/v1/collections/:slug returns 200 after reactivation',
    )

    // 14. Customer cannot create collection
    const res14 = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: 'Cust Col', slug: 'cust-col' }),
    })
    assert(
      res14.status === 403,
      '14. POST /api/v1/admin/collections with CUSTOMER token returns 403 Forbidden',
    )

    // 15. Customer cannot update collection
    const res15 = await fetch(`${BASE_URL}/api/v1/admin/collections/${testCollectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ tagline: 'Hacked Tagline' }),
    })
    assert(
      res15.status === 403,
      '15. PUT /api/v1/admin/collections/:id with CUSTOMER token returns 403 Forbidden',
    )

    // 16. Customer cannot delete collection
    const res16 = await fetch(`${BASE_URL}/api/v1/admin/collections/${testCollectionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    })
    assert(
      res16.status === 403,
      '16. DELETE /api/v1/admin/collections/:id with CUSTOMER token returns 403 Forbidden',
    )

    // 17. No-token admin request
    const res17 = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'No Token Col', slug: 'no-token-col' }),
    })
    assert(
      res17.status === 401,
      '17. POST /api/v1/admin/collections without token returns 401 Unauthorized',
    )

    // 18. Product collection filter compatibility
    const res18 = await fetch(`${BASE_URL}/api/v1/products?collection=anantara`).then((r) =>
      r.json(),
    )
    assert(
      res18.success === true &&
        res18.data.products.length > 0 &&
        res18.data.products.every((p) => p.collection === 'anantara'),
      '18. GET /api/v1/products?collection=anantara returns matching products',
    )

    // 19. Product API regression
    const res19 = await fetch(`${BASE_URL}/api/v1/products/anantara-polki-choker`).then((r) =>
      r.json(),
    )
    assert(
      res19.success === true && res19.data.product.slug === 'anantara-polki-choker',
      '19. GET /api/v1/products/:slug (B-03 regression) passes OK',
    )

    // 20. Admin product API regression
    const res20 = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res20.success === true && res20.data.pagination.total === 66,
      '20. GET /api/v1/admin/products (B-03 regression) returns total 66 products',
    )

    // 21. B-01/B-02 Auth & Health regression
    const res21 = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(
      res21.success === true && res21.data.database === 'connected',
      '21. GET /api/v1/health (B-01/B-02 regression) passes OK',
    )

    // Clean up test collection
    await Collection.deleteOne({ _id: testCollectionId })

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
