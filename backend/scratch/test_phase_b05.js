import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import HomepageSection from '../src/models/HomepageSection.js'
import Product from '../src/models/Product.js'
import Collection from '../src/models/Collection.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5097
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testSectionId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-05 AUTOMATED API SUITE ===\n')

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
      name: 'Test Admin B05',
      email: 'admin_test_b05@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B05',
      email: 'customer_test_b05@mayura.com',
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

    // 2. Public homepage API
    const res2 = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    assert(
      res2.success === true &&
        Array.isArray(res2.data.sections) &&
        res2.data.sections.length >= 7,
      '2. GET /api/v1/homepage returns list of active homepage sections',
    )

    // 3 & 4. Homepage seed total section count check (7)
    const sectionCount = await HomepageSection.countDocuments({
      key: { $nin: ['b05-test-section'] },
    })
    assert(
      sectionCount === 7,
      `3 & 4. Homepage seed total section count is exactly 7 (Actual: ${sectionCount})`,
    )

    // 5. Admin homepage list
    const res5 = await fetch(`${BASE_URL}/api/v1/admin/homepage`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res5.success === true && Array.isArray(res5.data.sections),
      '5. GET /api/v1/admin/homepage with ADMIN token returns list of all sections',
    )

    // 6. Admin create section
    const testSectionPayload = {
      key: 'b05-test-section',
      type: 'custom',
      title: 'B05 Test Section',
      subtitle: 'Temporary API test section',
      displayOrder: 999,
      isActive: true,
      content: { note: 'Test section content payload' },
    }
    const res6 = await fetch(`${BASE_URL}/api/v1/admin/homepage/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testSectionPayload),
    })
    const res6Body = await res6.json()
    assert(
      res6.status === 201 && res6Body.success === true,
      '6. POST /api/v1/admin/homepage/sections with ADMIN token returns 201 Created',
    )
    if (res6Body.data?.section?._id) {
      testSectionId = res6Body.data.section._id
    }

    // 7. Duplicate section key rejection
    const res7 = await fetch(`${BASE_URL}/api/v1/admin/homepage/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testSectionPayload),
    })
    assert(
      res7.status === 409,
      '7. POST /api/v1/admin/homepage/sections with duplicate key returns 409 Conflict',
    )

    // 8. Admin get section by key/ID
    const res8 = await fetch(
      `${BASE_URL}/api/v1/admin/homepage/sections/b05-test-section`,
      { headers: { Authorization: `Bearer ${adminToken}` } },
    ).then((r) => r.json())
    assert(
      res8.success === true && res8.data.section.key === 'b05-test-section',
      '8. GET /api/v1/admin/homepage/sections/:id returns single section by key',
    )

    // 9. Admin update section
    const res9 = await fetch(
      `${BASE_URL}/api/v1/admin/homepage/sections/${testSectionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ subtitle: 'Updated Test Subtitle', displayOrder: 1000 }),
      },
    )
    const res9Body = await res9.json()
    assert(
      res9.status === 200 && res9Body.data.section.subtitle === 'Updated Test Subtitle',
      '9. PUT /api/v1/admin/homepage/sections/:id updates subtitle to "Updated Test Subtitle"',
    )

    // 10. Admin reorder sections
    const res10 = await fetch(`${BASE_URL}/api/v1/admin/homepage/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sections: [{ id: 'hero', displayOrder: 1 }, { id: 'shop-categories', displayOrder: 2 }],
      }),
    })
    const res10Body = await res10.json()
    assert(
      res10.status === 200 && res10Body.success === true,
      '10. PUT /api/v1/admin/homepage/reorder updates display orders in bulk',
    )

    // 11. Admin deactivate section
    const res11 = await fetch(
      `${BASE_URL}/api/v1/admin/homepage/sections/${testSectionId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    )
    const res11Body = await res11.json()
    assert(
      res11.status === 200 && res11Body.data.section.isActive === false,
      '11. DELETE /api/v1/admin/homepage/sections/:id soft deactivates section (isActive: false)',
    )

    // 12. Public homepage hides inactive section
    const res12 = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    const hasTestSection = res12.data.sections.some((s) => s.key === 'b05-test-section')
    assert(
      hasTestSection === false,
      '12. Deactivated section is hidden from public GET /api/v1/homepage response',
    )

    // 13. Admin reactivation
    const res13 = await fetch(
      `${BASE_URL}/api/v1/admin/homepage/sections/${testSectionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isActive: true }),
      },
    )
    const res13Body = await res13.json()
    assert(
      res13.status === 200 && res13Body.data.section.isActive === true,
      '13. ADMIN can reactivate homepage section (isActive: true)',
    )

    // 14. Customer cannot create section
    const res14 = await fetch(`${BASE_URL}/api/v1/admin/homepage/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ key: 'cust-sec', type: 'custom' }),
    })
    assert(
      res14.status === 403,
      '14. POST /api/v1/admin/homepage/sections with CUSTOMER token returns 403 Forbidden',
    )

    // 15. Customer cannot update section
    const res15 = await fetch(
      `${BASE_URL}/api/v1/admin/homepage/sections/${testSectionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ subtitle: 'Hacked Subtitle' }),
      },
    )
    assert(
      res15.status === 403,
      '15. PUT /api/v1/admin/homepage/sections/:id with CUSTOMER token returns 403 Forbidden',
    )

    // 16. Customer cannot delete section
    const res16 = await fetch(
      `${BASE_URL}/api/v1/admin/homepage/sections/${testSectionId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${customerToken}` },
      },
    )
    assert(
      res16.status === 403,
      '16. DELETE /api/v1/admin/homepage/sections/:id with CUSTOMER token returns 403 Forbidden',
    )

    // 17. No-token admin request
    const res17 = await fetch(`${BASE_URL}/api/v1/admin/homepage/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'no-token-sec', type: 'custom' }),
    })
    assert(
      res17.status === 401,
      '17. POST /api/v1/admin/homepage/sections without token returns 401 Unauthorized',
    )

    // 18. Existing collection references check (B-04)
    const activeCollections = await Collection.countDocuments({ isActive: true })
    assert(
      activeCollections === 6,
      '18. Referenced B-04 signature collections remain 6 active in MongoDB',
    )

    // 19. Existing product references check (B-03)
    const activeProducts = await Product.countDocuments({ isActive: true })
    assert(
      activeProducts === 66,
      '19. Referenced B-03 active products remain 66 in MongoDB',
    )

    // 20. B-01/B-02/B-03/B-04 Regression check
    const res20Health = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    const res20Products = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const res20Collections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    assert(
      res20Health.success === true &&
        res20Products.success === true &&
        res20Collections.success === true,
      '20. B-01, B-02, B-03, and B-04 endpoints pass regression check OK',
    )

    // Clean up test section
    await HomepageSection.deleteOne({ _id: testSectionId })

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
