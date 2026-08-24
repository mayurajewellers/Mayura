import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import BlogPost from '../src/models/BlogPost.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5095
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testPostId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-07 AUTOMATED API SUITE ===\n')

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
      name: 'Test Admin B07',
      email: 'admin_test_b07@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B07',
      email: 'customer_test_b07@mayura.com',
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

    // 2. Public blog post listing
    const res2 = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    assert(
      res2.success === true &&
        Array.isArray(res2.data.posts) &&
        res2.data.posts.length >= 8,
      '2. GET /api/v1/blog returns published active blog posts',
    )

    // 3. Public category filter
    const res3 = await fetch(`${BASE_URL}/api/v1/blog?category=Buying+Guides`).then((r) =>
      r.json(),
    )
    assert(
      res3.success === true &&
        res3.data.posts.length > 0 &&
        res3.data.posts.every((p) => p.category === 'Buying Guides'),
      '3. GET /api/v1/blog?category=Buying+Guides filters posts by category',
    )

    // 4. Public single post lookup by slug
    const res4 = await fetch(`${BASE_URL}/api/v1/blog/how-to-read-a-hallmark`).then((r) =>
      r.json(),
    )
    assert(
      res4.success === true && res4.data.post.slug === 'how-to-read-a-hallmark',
      '4. GET /api/v1/blog/how-to-read-a-hallmark returns single post details',
    )

    // 5. Related posts included in single post response
    assert(
      Array.isArray(res4.data.relatedPosts) && res4.data.relatedPosts.length > 0,
      '5. GET /api/v1/blog/:slug includes related posts array',
    )

    // 6. Invalid blog post slug lookup
    const res6Status = await fetch(`${BASE_URL}/api/v1/blog/invalid-blog-slug`).then(
      (r) => r.status,
    )
    assert(res6Status === 404, '6. GET /api/v1/blog/invalid-blog-slug returns 404')

    // 7. Blog seed count check
    const postCount = await BlogPost.countDocuments({
      slug: { $nin: ['b07-test-post'] },
    })
    assert(
      postCount === 8,
      `7. Blog seed total count is exactly 8 (Actual: ${postCount})`,
    )

    // 8. Admin blog list
    const res8 = await fetch(`${BASE_URL}/api/v1/admin/blog`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res8.success === true && Array.isArray(res8.data.posts),
      '8. GET /api/v1/admin/blog with ADMIN token returns list of all posts',
    )

    // 9. Admin create draft blog post
    const testPostPayload = {
      legacyId: 'BLOG-TEST-07',
      title: 'B07 Test Post',
      slug: 'b07-test-post',
      category: 'Buying Guides',
      author: 'Test Author',
      excerpt: 'Temporary B07 test post excerpt text',
      content: [{ type: 'paragraph', text: 'Test paragraph content for B07' }],
      coverImage: '/images/editorial/studs-gold-rosette.jpg',
      status: 'DRAFT',
      isActive: true,
    }
    const res9 = await fetch(`${BASE_URL}/api/v1/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testPostPayload),
    })
    const res9Body = await res9.json()
    assert(
      res9.status === 201 && res9Body.success === true,
      '9. POST /api/v1/admin/blog with ADMIN token creates DRAFT post (201 Created)',
    )
    if (res9Body.data?.post?._id) {
      testPostId = res9Body.data.post._id
    }

    // 10. Public API hides DRAFT post
    const res10Status = await fetch(`${BASE_URL}/api/v1/blog/b07-test-post`).then(
      (r) => r.status,
    )
    assert(
      res10Status === 404,
      '10. DRAFT blog post is strictly hidden (404) from public GET /api/v1/blog/:slug',
    )

    // 11. Duplicate slug rejection
    const res11 = await fetch(`${BASE_URL}/api/v1/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ...testPostPayload, legacyId: 'BLOG-DIFF-07' }),
    })
    assert(
      res11.status === 409,
      '11. POST /api/v1/admin/blog with duplicate slug returns 409 Conflict',
    )

    // 12. Admin get post by ID/slug/legacyId
    const res12 = await fetch(`${BASE_URL}/api/v1/admin/blog/b07-test-post`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(
      res12.success === true && res12.data.post.slug === 'b07-test-post',
      '12. GET /api/v1/admin/blog/:id returns single post by slug',
    )

    // 13. Admin update post to PUBLISHED
    const res13 = await fetch(`${BASE_URL}/api/v1/admin/blog/${testPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'PUBLISHED' }),
    })
    const res13Body = await res13.json()
    assert(
      res13.status === 200 && res13Body.data.post.status === 'PUBLISHED',
      '13. PUT /api/v1/admin/blog/:id updates status to "PUBLISHED"',
    )

    // 14. Public API shows published post
    const res14 = await fetch(`${BASE_URL}/api/v1/blog/b07-test-post`).then((r) =>
      r.json(),
    )
    assert(
      res14.success === true && res14.data.post.slug === 'b07-test-post',
      '14. Public GET /api/v1/blog/:slug returns 200 OK after publishing',
    )

    // 15. Admin deactivate post
    const res15 = await fetch(`${BASE_URL}/api/v1/admin/blog/${testPostId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const res15Body = await res15.json()
    assert(
      res15.status === 200 && res15Body.data.post.isActive === false,
      '15. DELETE /api/v1/admin/blog/:id soft deactivates post (isActive: false)',
    )

    // 16. Public API hides deactivated post
    const res16Status = await fetch(`${BASE_URL}/api/v1/blog/b07-test-post`).then(
      (r) => r.status,
    )
    assert(
      res16Status === 404,
      '16. Deactivated blog post is hidden (404) from public GET /api/v1/blog/:slug',
    )

    // 17. Admin reactivation
    const res17 = await fetch(`${BASE_URL}/api/v1/admin/blog/${testPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isActive: true }),
    })
    const res17Body = await res17.json()
    assert(
      res17.status === 200 && res17Body.data.post.isActive === true,
      '17. ADMIN can reactivate post (isActive: true)',
    )

    // 18. Customer cannot mutate blog post
    const res18 = await fetch(`${BASE_URL}/api/v1/admin/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ title: 'Cust Post', slug: 'cust-post', category: 'Buying Guides', excerpt: 'ex', content: 'co', coverImage: '/img.jpg' }),
    })
    assert(
      res18.status === 403,
      '18. POST /api/v1/admin/blog with CUSTOMER token returns 403 Forbidden',
    )

    // 19. No-token admin request
    const res19 = await fetch(`${BASE_URL}/api/v1/admin/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'No Token', slug: 'no-token', category: 'Buying Guides', excerpt: 'ex', content: 'co', coverImage: '/img.jpg' }),
    })
    assert(
      res19.status === 401,
      '19. POST /api/v1/admin/blog without token returns 401 Unauthorized',
    )

    // 20. B-01 to B-06 Regression check
    const res20Health = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    const res20Products = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const res20Collections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    const res20Homepage = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    const res20Banners = await fetch(`${BASE_URL}/api/v1/banners`).then((r) => r.json())
    assert(
      res20Health.success === true &&
        res20Products.success === true &&
        res20Collections.success === true &&
        res20Homepage.success === true &&
        res20Banners.success === true,
      '20. B-01, B-02, B-03, B-04, B-05, and B-06 endpoints pass regression check OK',
    )

    // Clean up test post
    await BlogPost.deleteOne({ _id: testPostId })

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
