import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5099
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testProductId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-03 AUTOMATED API SUITE ===\n')

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
      name: 'Test Admin B03',
      email: 'admin_test_b03@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B03',
      email: 'customer_test_b03@mayura.com',
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
    // 1. Health
    const res1 = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(
      res1.success === true && res1.data.database === 'connected',
      '1. GET /api/v1/health returns 200 OK with database connected',
    )

    // 2. Public products
    const res2 = await fetch(`${BASE_URL}/api/v1/products`).then((r) => r.json())
    assert(
      res2.success === true && Array.isArray(res2.data.products) && res2.data.products.length > 0,
      '2. GET /api/v1/products returns active products array',
    )

    // 3. Public product pagination
    const res3 = await fetch(`${BASE_URL}/api/v1/products?page=1&limit=10`).then((r) => r.json())
    assert(
      res3.success === true &&
        res3.data.products.length === 10 &&
        res3.data.pagination.limit === 10 &&
        res3.data.pagination.total === 66,
      '3. GET /api/v1/products?page=1&limit=10 returns exactly 10 products',
    )

    // 4. Product slug
    const res4 = await fetch(`${BASE_URL}/api/v1/products/anantara-polki-choker`).then((r) =>
      r.json(),
    )
    assert(
      res4.success === true && res4.data.product.slug === 'anantara-polki-choker',
      '4. GET /api/v1/products/:slug returns correct product',
    )

    // 5. Invalid slug
    const res5Status = await fetch(`${BASE_URL}/api/v1/products/invalid-slug-12345`).then(
      (r) => r.status,
    )
    assert(res5Status === 404, '5. GET /api/v1/products/invalid-slug returns 404')

    // 6. Admin product list
    const res6 = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res6.success === true && Array.isArray(res6.data.products),
      '6. GET /api/v1/admin/products with ADMIN token returns list',
    )

    // 7. Create product with ADMIN token
    const testProductPayload = {
      legacyId: 'MJ-TEST-9999',
      sku: 'MJTEST9999',
      slug: 'b03-test-ruby-necklace',
      name: 'B03 Test Ruby Necklace',
      type: 'necklaces',
      collection: 'anantara',
      departments: ['bridal-collection', 'gold-jewellery'],
      audience: 'women',
      price: 250000,
      images: ['/images/products/test.jpg'],
      metal: '22K Yellow Gold',
      metalKey: 'yellow-gold',
      purity: '22K · 916 hallmarked',
      grossWeight: 30.5,
      netWeight: 28.0,
      makingCharges: '15% of gold value',
      shipping: 'Free delivery across India.',
      returns: '15-day return policy.',
      certification: 'BIS hallmarked.',
      description: 'Test ruby necklace for B-03 automated verification.',
    }
    const res7 = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testProductPayload),
    })
    const res7Body = await res7.json()
    assert(
      res7.status === 201 && res7Body.success === true,
      '7. POST /api/v1/admin/products with ADMIN token returns 201',
    )
    if (res7Body.data?.product?._id) {
      testProductId = res7Body.data.product._id
    }

    // 8. Create product with CUSTOMER token -> 403
    const res8 = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ ...testProductPayload, sku: 'MJTEST8888', slug: 'test-8888' }),
    })
    assert(res8.status === 403, '8. POST /api/v1/admin/products with CUSTOMER token returns 403')

    // 9. Create product without token -> 401
    const res9 = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...testProductPayload, sku: 'MJTEST7777', slug: 'test-7777' }),
    })
    assert(res9.status === 401, '9. POST /api/v1/admin/products without token returns 401')

    // 10. Duplicate SKU -> 409
    const res10 = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ...testProductPayload, slug: 'different-slug-10' }),
    })
    assert(res10.status === 409, '10. POST /api/v1/admin/products with duplicate SKU returns 409')

    // 11. Duplicate slug -> 409
    const res11 = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ...testProductPayload, sku: 'MJTEST1111' }),
    })
    assert(res11.status === 409, '11. POST /api/v1/admin/products with duplicate slug returns 409')

    // 12. Update product
    const res12 = await fetch(`${BASE_URL}/api/v1/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ price: 275000, name: 'B03 Test Ruby Necklace Updated' }),
    })
    const res12Body = await res12.json()
    assert(
      res12.status === 200 && res12Body.data.product.price === 275000,
      '12. PUT /api/v1/admin/products/:id updates price to 275000',
    )

    // 13. Update product with CUSTOMER token -> 403
    const res13 = await fetch(`${BASE_URL}/api/v1/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ price: 300000 }),
    })
    assert(res13.status === 403, '13. PUT /api/v1/admin/products/:id with CUSTOMER token returns 403')

    // 14. Delete / deactivate product with ADMIN token
    const res14 = await fetch(`${BASE_URL}/api/v1/admin/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const res14Body = await res14.json()
    assert(
      res14.status === 200 && res14Body.data.product.isActive === false,
      '14. DELETE /api/v1/admin/products/:id soft deactivates product',
    )

    // 15. Deactivated product hides from public API
    const res15 = await fetch(`${BASE_URL}/api/v1/products/b03-test-ruby-necklace`).then((r) =>
      r.status,
    )
    assert(
      res15 === 404,
      '15. Deactivated product is hidden (404) from public GET /api/v1/products/:slug',
    )

    // 16. Search
    const res16 = await fetch(`${BASE_URL}/api/v1/products?search=polki`).then((r) => r.json())
    assert(
      res16.success === true && res16.data.products.some((p) => p.slug.includes('polki')),
      '16. GET /api/v1/products?search=polki returns matching items',
    )

    // 17. Filtering
    const res17 = await fetch(
      `${BASE_URL}/api/v1/products?collection=anantara&type=necklaces`,
    ).then((r) => r.json())
    assert(
      res17.success === true &&
        res17.data.products.every((p) => p.collection === 'anantara' && p.type === 'necklaces'),
      '17. GET /api/v1/products with collection & type filters returns matching subset',
    )

    // 18. Sorting
    const res18 = await fetch(`${BASE_URL}/api/v1/products?sort=price-asc&limit=5`).then((r) =>
      r.json(),
    )
    const prices = res18.data.products.map((p) => p.price)
    const isSortedAsc = prices.every((val, i, arr) => !i || arr[i - 1] <= val)
    assert(isSortedAsc, '18. GET /api/v1/products?sort=price-asc returns prices in ascending order')

    // 19. Pagination metadata
    const res19 = await fetch(`${BASE_URL}/api/v1/products?page=2&limit=5`).then((r) => r.json())
    assert(
      res19.data.pagination.page === 2 &&
        res19.data.pagination.limit === 5 &&
        res19.data.pagination.total === 66 &&
        res19.data.pagination.totalPages === 14,
      '19. Pagination metadata (page=2, limit=5, total=66, totalPages=14) is accurate',
    )

    // Clean up test product
    await Product.deleteOne({ _id: testProductId })

    // 20 & 21. Count check
    const totalCount = await Product.countDocuments({ legacyId: { $ne: 'MJ-TEST-9999' } })
    assert(
      totalCount === 66,
      `20 & 21. Total MongoDB product count remains exactly 66 (Actual: ${totalCount})`,
    )

    // 22. Health regression
    const res22 = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(
      res22.success === true && res22.data.database === 'connected',
      '22. GET /api/v1/health regression test passes OK',
    )

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
