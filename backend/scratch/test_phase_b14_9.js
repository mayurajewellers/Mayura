import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Banner from '../src/models/Banner.js'
import Media from '../src/models/Media.js'
import BlogPost from '../src/models/BlogPost.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5096
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.9 AUTOMATED BANNERS, MEDIA & BLOG TEST SUITE ===\n')

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
    // 1. Authorization Tokens
    let adminUser = await User.findOne({ role: 'ADMIN', isActive: true })
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10)
      adminUser = await User.create({
        name: 'Test Admin B14-9',
        email: `admin_b14_9_${Date.now()}@example.com`,
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
        name: 'Test Customer B14-9',
        email: `cust_b14_9_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'CUSTOMER',
      })
    }
    const custToken = signToken({ userId: custUser._id.toString(), role: custUser.role })

    // --- Authorization Tests ---
    const rBannerGuest = await fetch(`${BASE_URL}/api/v1/admin/banners`)
    assert(rBannerGuest.status === 401, '1. Guest access to GET /api/v1/admin/banners returns 401 Unauthorized')

    const rBannerCust = await fetch(`${BASE_URL}/api/v1/admin/banners`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(rBannerCust.status === 403, '2. CUSTOMER access to GET /api/v1/admin/banners returns 403 Forbidden')

    const rMediaGuest = await fetch(`${BASE_URL}/api/v1/admin/media`)
    assert(rMediaGuest.status === 401, '3. Guest access to GET /api/v1/admin/media returns 401 Unauthorized')

    const rMediaCust = await fetch(`${BASE_URL}/api/v1/admin/media`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(rMediaCust.status === 403, '4. CUSTOMER access to GET /api/v1/admin/media returns 403 Forbidden')

    const rBlogGuest = await fetch(`${BASE_URL}/api/v1/admin/blog`)
    assert(rBlogGuest.status === 401, '5. Guest access to GET /api/v1/admin/blog returns 401 Unauthorized')

    const rBlogCust = await fetch(`${BASE_URL}/api/v1/admin/blog`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(rBlogCust.status === 403, '6. CUSTOMER access to GET /api/v1/admin/blog returns 403 Forbidden')

    // --- Admin Banners CRUD ---
    const rAdminBanners = await fetch(`${BASE_URL}/api/v1/admin/banners`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminBanners.success === true && Array.isArray(rAdminBanners.data?.banners), '7. ADMIN can list admin banners')

    const testBannerSlug = `test-banner-${Date.now()}`
    const rCreateBanner = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Test B14-9 Banner',
        slug: testBannerSlug,
        placement: 'homepage-hero',
        desktopImage: '/images/hero/carousel-1.jpg',
        isActive: true,
      }),
    }).then((r) => r.json())

    assert(rCreateBanner.success === true && rCreateBanner.data?.banner?.slug === testBannerSlug, '8. ADMIN can create a banner')
    const createdBannerId = rCreateBanner.data?.banner?._id

    const rDupBanner = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Duplicate Banner',
        slug: testBannerSlug,
        placement: 'homepage-hero',
        desktopImage: '/images/hero/carousel-1.jpg',
      }),
    })
    assert(rDupBanner.status === 409, '9. Duplicate banner slug is rejected with 409 Conflict')

    const rDelBanner = await fetch(`${BASE_URL}/api/v1/admin/banners/${createdBannerId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then((r) => r.json())
    assert(rDelBanner.success === true, '10. ADMIN can soft-delete banner')

    // --- Admin Media CRUD ---
    const testPublicId = `test-media-${Date.now()}`
    const rCreateMedia = await fetch(`${BASE_URL}/api/v1/admin/media`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Test B14-9 Media',
        publicId: testPublicId,
        url: '/images/editorial/test.jpg',
        provider: 'local',
        resourceType: 'image',
        folder: 'test',
        isActive: true,
      }),
    }).then((r) => r.json())

    assert(rCreateMedia.success === true && rCreateMedia.data?.media?.publicId === testPublicId, '11. ADMIN can register media asset')
    const createdMediaId = rCreateMedia.data?.media?._id

    const rDelMedia = await fetch(`${BASE_URL}/api/v1/admin/media/${createdMediaId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then((r) => r.json())
    assert(rDelMedia.success === true, '12. ADMIN can soft-delete media asset')

    // --- Admin Blog CRUD ---
    const testBlogSlug = `test-blog-${Date.now()}`
    const rCreateBlog = await fetch(`${BASE_URL}/api/v1/admin/blog`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Test B14-9 Blog Post',
        slug: testBlogSlug,
        category: 'Buying Guides',
        excerpt: 'Comprehensive testing guide for jewellery blog posts.',
        content: '<p>Content for B14-9 test blog post</p>',
        coverImage: '/images/editorial/test.jpg',
        status: 'DRAFT',
        isActive: true,
      }),
    }).then((r) => r.json())

    assert(rCreateBlog.success === true && rCreateBlog.data?.post?.status === 'DRAFT', '13. ADMIN can create DRAFT blog post')
    const createdBlogId = rCreateBlog.data?.post?._id

    // Draft post should be hidden from public blog API
    const rPubBlogDraft = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    const foundDraftInPublic = rPubBlogDraft.data?.posts?.some((p) => p.slug === testBlogSlug)
    assert(!foundDraftInPublic, '14. DRAFT blog post is hidden from public blog API')

    // Publish post
    const rPublishBlog = await fetch(`${BASE_URL}/api/v1/admin/blog/${createdBlogId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'PUBLISHED' }),
    }).then((r) => r.json())
    assert(rPublishBlog.success === true && rPublishBlog.data?.post?.status === 'PUBLISHED', '15. ADMIN can publish blog post')

    // Published post should now appear on public blog API
    const rPubBlogPublished = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    const foundPublishedInPublic = rPubBlogPublished.data?.posts?.some((p) => p.slug === testBlogSlug)
    assert(foundPublishedInPublic, '16. PUBLISHED blog post appears on public blog API')

    // Archive / soft delete blog post
    const rDelBlog = await fetch(`${BASE_URL}/api/v1/admin/blog/${createdBlogId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then((r) => r.json())
    assert(rDelBlog.success === true, '17. ADMIN can archive/soft-delete blog post')

    // Clean up temporary test records from MongoDB
    if (createdBannerId) await Banner.findByIdAndDelete(createdBannerId)
    if (createdMediaId) await Media.findByIdAndDelete(createdMediaId)
    if (createdBlogId) await BlogPost.findByIdAndDelete(createdBlogId)

    console.log(`\n=== B-14.9 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
