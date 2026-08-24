import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Policy from '../src/models/Policy.js'
import SiteSettings from '../src/models/SiteSettings.js'
import Page from '../src/models/Page.js'
import NavigationItem from '../src/models/NavigationItem.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5093
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testPolicyId = ''
let testPageId = ''
let testNavId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-09 AUTOMATED API SUITE ===\n')

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
      name: 'Test Admin B09',
      email: 'admin_test_b09@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B09',
      email: 'customer_test_b09@mayura.com',
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

    // --- POLICIES TESTS ---
    // 2. Public Policies list
    const res2 = await fetch(`${BASE_URL}/api/v1/policies`).then((r) => r.json())
    assert(
      res2.success === true && Array.isArray(res2.data.policies) && res2.data.policies.length >= 4,
      '2. GET /api/v1/policies returns active policies',
    )

    // 3. Public single policy lookup by slug
    const res3 = await fetch(`${BASE_URL}/api/v1/policies/privacy-policy`).then((r) => r.json())
    assert(
      res3.success === true && res3.data.policy.slug === 'privacy-policy',
      '3. GET /api/v1/policies/privacy-policy returns single policy by slug',
    )

    // 4. Admin create policy
    const testPolicyPayload = {
      legacyId: 'pol-b09-test',
      slug: 'b09-test-policy',
      title: 'B09 Test Policy',
      sections: [{ heading: 'H1', paragraphs: ['P1'] }],
      isActive: true,
    }
    const res4 = await fetch(`${BASE_URL}/api/v1/admin/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(testPolicyPayload),
    })
    const res4Body = await res4.json()
    assert(
      res4.status === 201 && res4Body.success === true,
      '4. POST /api/v1/admin/policies with ADMIN token creates policy (201 Created)',
    )
    if (res4Body.data?.policy?._id) {
      testPolicyId = res4Body.data.policy._id
    }

    // 5. Duplicate policy slug rejection (409 Conflict)
    const res5 = await fetch(`${BASE_URL}/api/v1/admin/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ ...testPolicyPayload, legacyId: 'pol-dup-test' }),
    })
    assert(res5.status === 409, '5. POST /api/v1/admin/policies duplicate slug returns 409 Conflict')

    // --- SITE SETTINGS TESTS (SINGLETON) ---
    // 6. Public Site Settings lookup
    const res6 = await fetch(`${BASE_URL}/api/v1/settings`).then((r) => r.json())
    assert(
      res6.success === true && res6.data.settings.key === 'main',
      '6. GET /api/v1/settings returns singleton site settings',
    )

    // 7. Admin update site settings
    const res7 = await fetch(`${BASE_URL}/api/v1/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ brand: { tagline: 'Updated B09 Tagline' } }),
    }).then((r) => r.json())
    assert(
      res7.success === true && res7.data.settings.brand.tagline === 'Updated B09 Tagline',
      '7. PUT /api/v1/admin/settings updates singleton settings',
    )

    // 8. Singleton count check in MongoDB
    const settingsCount = await SiteSettings.countDocuments()
    assert(settingsCount === 1, '8. SiteSettings collection maintains exactly 1 singleton document')

    // --- PAGES & NAVIGATION TESTS ---
    // 9. Public Page lookup by slug
    const res9 = await fetch(`${BASE_URL}/api/v1/pages/about`).then((r) => r.json())
    assert(
      res9.success === true && res9.data.page.slug === 'about',
      '9. GET /api/v1/pages/about returns about page',
    )

    // 10. Public Navigation list
    const res10 = await fetch(`${BASE_URL}/api/v1/navigation`).then((r) => r.json())
    assert(
      res10.success === true && Array.isArray(res10.data.items) && res10.data.items.length >= 8,
      '10. GET /api/v1/navigation returns active navigation items',
    )

    // 11. Unsafe navigation URL rejection
    const res11 = await fetch(`${BASE_URL}/api/v1/admin/navigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ legacyId: 'nav-unsafe', label: 'Unsafe', to: 'javascript:alert(1)' }),
    })
    assert(
      res11.status === 400,
      '11. POST /api/v1/admin/navigation with javascript: URL returns 400 Bad Request',
    )

    // --- SECURITY & AUTHORIZATION TESTS ---
    // 12. Customer token rejected on admin settings
    const res12 = await fetch(`${BASE_URL}/api/v1/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ brand: { tagline: 'Hack' } }),
    })
    assert(res12.status === 403, '12. CUSTOMER token on admin settings returns 403 Forbidden')

    // 13. Unauthenticated request rejected
    const res13 = await fetch(`${BASE_URL}/api/v1/admin/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'T', slug: 's', sections: [] }),
    })
    assert(res13.status === 401, '13. Unauthenticated admin request returns 401 Unauthorized')

    // --- REGRESSION TESTS (B-01 to B-08) ---
    // 14. Full B-01 to B-08 Regression
    const rHealth = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    const rProducts = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const rCollections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    const rHomepage = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    const rBanners = await fetch(`${BASE_URL}/api/v1/banners`).then((r) => r.json())
    const rBlog = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    const rTestimonials = await fetch(`${BASE_URL}/api/v1/testimonials`).then((r) => r.json())
    const rGallery = await fetch(`${BASE_URL}/api/v1/gallery`).then((r) => r.json())
    const rFaqs = await fetch(`${BASE_URL}/api/v1/faqs`).then((r) => r.json())

    assert(
      rHealth.success === true &&
        rProducts.success === true &&
        rCollections.success === true &&
        rHomepage.success === true &&
        rBanners.success === true &&
        rBlog.success === true &&
        rTestimonials.success === true &&
        rGallery.success === true &&
        rFaqs.success === true,
      '14. B-01 through B-08 endpoints pass regression check OK',
    )

    // Clean up temporary test entries
    await Policy.deleteOne({ _id: testPolicyId })

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
