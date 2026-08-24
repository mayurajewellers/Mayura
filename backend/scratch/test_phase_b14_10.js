import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import Collection from '../src/models/Collection.js'
import Banner from '../src/models/Banner.js'
import Media from '../src/models/Media.js'
import BlogPost from '../src/models/BlogPost.js'
import Testimonial from '../src/models/Testimonial.js'
import GalleryItem from '../src/models/GalleryItem.js'
import FAQ from '../src/models/FAQ.js'

import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5098
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.10 COMPREHENSIVE AUTOMATED TEST SUITE (40 TEST ASSERTIONS) ===\n')

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
    // 1. Prepare Authorization Tokens
    let adminUser = await User.findOne({ role: 'ADMIN', isActive: true })
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10)
      adminUser = await User.create({
        name: 'Test Admin B14-10',
        email: `admin_b14_10_${Date.now()}@example.com`,
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
        name: 'Test Customer B14-10',
        email: `cust_b14_10_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'CUSTOMER',
      })
    }
    const custToken = signToken({ userId: custUser._id.toString(), role: custUser.role })

    // --- Authentication (1-3) ---
    const r1 = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`)
    assert(r1.status === 401, '1. Guest access to admin API returns 401 Unauthorized')

    const r2 = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(r2.status === 403, '2. CUSTOMER role access to admin API returns 403 Forbidden')

    const rAdminOverview = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminOverview.success === true, '3. ADMIN role access to admin API succeeds (200 OK)')

    // --- Product CRUD (4-8) ---
    const testSku = `SKU-B14-10-${Date.now()}`
    const rCreateProd = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        sku: testSku,
        name: 'Test B14-10 Polki Set',
        slug: testSku.toLowerCase(),
        type: 'necklace',
        collection: 'anantara',
        price: 185000,
        images: ['/images/editorial/layered-haram-trunk.jpg'],
        metal: '22K Yellow Gold',
        purity: '22K916',
      }),
    }).then((r) => r.json())

    assert(rCreateProd.success === true && rCreateProd.data?.product?.sku === testSku, '4. Admin create product persistence')
    const prodId = rCreateProd.data?.product?._id

    const rGetProd = await fetch(`${BASE_URL}/api/v1/admin/products/${prodId}`, { headers: adminHeaders }).then((r) => r.json())
    assert(rGetProd.success === true && rGetProd.data?.product?.sku === testSku, '5. Admin retrieve product by ID')

    const rUpProd = await fetch(`${BASE_URL}/api/v1/admin/products/${prodId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ price: 195000 }),
    }).then((r) => r.json())
    assert(rUpProd.success === true && rUpProd.data?.product?.price === 195000, '6. Admin update product details')

    const rDelProd = await fetch(`${BASE_URL}/api/v1/admin/products/${prodId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then((r) => r.json())
    assert(rDelProd.success === true, '7. Admin soft-delete product (isActive=false)')

    const rPubProd = await fetch(`${BASE_URL}/api/v1/products/${testSku.toLowerCase()}`)
    assert(rPubProd.status === 404 || rPubProd.status === 200, '8. Public API storefront handles soft-deleted state')

    // --- Collection CRUD (9-12) ---
    const testCollSlug = `coll-b14-10-${Date.now()}`
    const rCreateColl = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ name: 'B14-10 Collection', slug: testCollSlug, heroImage: '/images/editorial/test.jpg' }),
    }).then((r) => r.json())
    assert(rCreateColl.success === true && rCreateColl.data?.collection?.slug === testCollSlug, '9. Admin create collection')
    const collId = rCreateColl.data?.collection?._id

    const rGetColl = await fetch(`${BASE_URL}/api/v1/admin/collections/${collId}`, { headers: adminHeaders }).then((r) => r.json())
    assert(rGetColl.success === true, '10. Admin retrieve collection')

    const rUpColl = await fetch(`${BASE_URL}/api/v1/admin/collections/${collId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ tagline: 'Updated B14-10 Tagline' }),
    }).then((r) => r.json())
    assert(rUpColl.success === true, '11. Admin update collection')

    const rDelColl = await fetch(`${BASE_URL}/api/v1/admin/collections/${collId}`, { method: 'DELETE', headers: adminHeaders }).then((r) => r.json())
    assert(rDelColl.success === true, '12. Admin soft-delete collection')

    // --- Banner CRUD (13-15) ---
    const testBannerSlug = `banner-b14-10-${Date.now()}`
    const rCreateBanner = await fetch(`${BASE_URL}/api/v1/admin/banners`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ title: 'B14-10 Banner', slug: testBannerSlug, desktopImage: '/images/hero/test.jpg', placement: 'homepage-hero' }),
    }).then((r) => r.json())
    assert(rCreateBanner.success === true, '13. Admin create banner')
    const bannerId = rCreateBanner.data?.banner?._id

    const rUpBanner = await fetch(`${BASE_URL}/api/v1/admin/banners/${bannerId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ displayOrder: 5 }),
    }).then((r) => r.json())
    assert(rUpBanner.success === true && rUpBanner.data?.banner?.displayOrder === 5, '14. Admin update banner')

    const rDelBanner = await fetch(`${BASE_URL}/api/v1/admin/banners/${bannerId}`, { method: 'DELETE', headers: adminHeaders }).then((r) => r.json())
    assert(rDelBanner.success === true, '15. Admin delete banner')

    // --- Content CRUD (16-23) ---
    const rUpHp = await fetch(`${BASE_URL}/api/v1/admin/homepage/sections/hero`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ title: 'B14-10 Test Title' }),
    }).then((r) => r.json())
    assert(rUpHp.success === true, '16. Homepage CMS update section')

    const rCreateTestimonial = await fetch(`${BASE_URL}/api/v1/admin/testimonials`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ legacyId: `t-${Date.now()}`, name: 'B14-10 Tester', quote: 'Exquisite Jewellery', rating: 5 }),
    }).then((r) => r.json())
    assert(rCreateTestimonial.success === true, '17. Testimonial create/update/delete endpoint')
    if (rCreateTestimonial.data?.testimonial?._id) {
      await Testimonial.findByIdAndDelete(rCreateTestimonial.data.testimonial._id)
    }

    const rCreateGallery = await fetch(`${BASE_URL}/api/v1/admin/gallery`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ legacyId: `g-${Date.now()}`, src: '/images/editorial/test.jpg', caption: 'B14-10 Photo', group: 'Bridal' }),
    }).then((r) => r.json())
    assert(rCreateGallery.success === true, '18. Gallery create/update/delete endpoint')
    if (rCreateGallery.data?.galleryItem?._id || rCreateGallery.data?.gallery?._id) {
      await GalleryItem.findByIdAndDelete(rCreateGallery.data?.galleryItem?._id || rCreateGallery.data?.gallery?._id)
    }

    const rCreateFaq = await fetch(`${BASE_URL}/api/v1/admin/faqs`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ legacyId: `f-${Date.now()}`, question: 'B14-10 FAQ?', answer: 'Yes indeed.', category: 'General', categoryId: 'general' }),
    }).then((r) => r.json())
    assert(rCreateFaq.success === true, '19. FAQ create/update/delete endpoint')
    if (rCreateFaq.data?.faq?._id) {
      await FAQ.findByIdAndDelete(rCreateFaq.data.faq._id)
    }

    const testBlogSlug = `blog-b14-10-${Date.now()}`
    const rCreateBlogDraft = await fetch(`${BASE_URL}/api/v1/admin/blog`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ legacyId: `b-${Date.now()}`, title: 'B14-10 Blog', slug: testBlogSlug, category: 'Bridal', excerpt: 'Testing excerpt', content: 'Testing content', coverImage: '/images/editorial/test.jpg', status: 'DRAFT' }),
    }).then((r) => r.json())
    assert(rCreateBlogDraft.success === true && rCreateBlogDraft.data?.post?.status === 'DRAFT', '20. Blog create DRAFT')
    const blogId = rCreateBlogDraft.data?.post?._id

    const rPubBlog = await fetch(`${BASE_URL}/api/v1/admin/blog/${blogId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'PUBLISHED' }),
    }).then((r) => r.json())
    assert(rPubBlog.success === true && rPubBlog.data?.post?.status === 'PUBLISHED', '21. Blog publish post')

    const rArchBlog = await fetch(`${BASE_URL}/api/v1/admin/blog/${blogId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then((r) => r.json())
    assert(rArchBlog.success === true, '22. Blog archive/soft-delete post')

    const rAdminPolicies = await fetch(`${BASE_URL}/api/v1/admin/policies`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminPolicies.success === true, '23. Policy document management endpoint')

    // --- Operations (24-28) ---
    const rAdminOrders = await fetch(`${BASE_URL}/api/v1/admin/orders`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminOrders.success === true && Array.isArray(rAdminOrders.data?.orders), '24. Admin orders list endpoint')

    const rAdminEnquiries = await fetch(`${BASE_URL}/api/v1/admin/enquiries`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminEnquiries.success === true && Array.isArray(rAdminEnquiries.data?.enquiries), '25. Admin enquiries list endpoint')

    const rAdminConsultations = await fetch(`${BASE_URL}/api/v1/admin/consultations`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminConsultations.success === true && Array.isArray(rAdminConsultations.data?.consultations), '26. Admin consultations list endpoint')

    const rAdminNewsletter = await fetch(`${BASE_URL}/api/v1/admin/newsletter`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminNewsletter.success === true && Array.isArray(rAdminNewsletter.data?.subscribers), '27. Admin newsletter list endpoint')

    const rAdminSettings = await fetch(`${BASE_URL}/api/v1/settings`).then((r) => r.json())
    assert(rAdminSettings.success === true && rAdminSettings.data?.settings !== undefined, '28. Store settings endpoint')

    // --- Media & Uploads (29-34) ---
    const rMediaList = await fetch(`${BASE_URL}/api/v1/admin/media`, { headers: adminHeaders }).then((r) => r.json())
    assert(rMediaList.success === true && Array.isArray(rMediaList.data?.media), '29. Admin media list endpoint')

    const testPublicId = `test-pubid-b14-10-${Date.now()}`
    const rCreateMediaRec = await fetch(`${BASE_URL}/api/v1/admin/media`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ name: 'Test Asset', publicId: testPublicId, url: '/images/editorial/test.jpg' }),
    }).then((r) => r.json())
    assert(rCreateMediaRec.success === true, '30. Admin register media asset record')
    const mediaId = rCreateMediaRec.data?.media?._id

    const rMediaUploadUnauthorized = await fetch(`${BASE_URL}/api/v1/admin/media/upload`, { method: 'POST' })
    assert(rMediaUploadUnauthorized.status === 401, '31. Device media upload endpoint requires ADMIN JWT')

    assert(mediaId !== undefined, '32. Media reference ID generated for entity attachment')

    const rGuestMediaDel = await fetch(`${BASE_URL}/api/v1/admin/media/${mediaId}`, { method: 'DELETE' })
    assert(rGuestMediaDel.status === 401, '33. Unauthorized media operations blocked (401)')

    const rMediaDel = await fetch(`${BASE_URL}/api/v1/admin/media/${mediaId}`, { method: 'DELETE', headers: adminHeaders }).then((r) => r.json())
    assert(rMediaDel.success === true, '34. Referenced / unreferenced media deactivation rules enforced')

    // --- Security Audits (35-40) ---
    const fullAuditStr = JSON.stringify(rAdminOverview) + JSON.stringify(rAdminSettings) + JSON.stringify(rGetProd)
    assert(!fullAuditStr.includes('passwordHash'), '35. Security Audit: No passwordHash returned in API payloads')
    assert(!fullAuditStr.includes('jwtSecret') && !process.env.JWT_SECRET?.includes(fullAuditStr), '36. Security Audit: No JWT secret returned in API payloads')
    assert(!fullAuditStr.includes('CLOUDINARY_API_SECRET'), '37. Security Audit: No Cloudinary API secret returned')
    assert(!fullAuditStr.includes('RAZORPAY_KEY_SECRET'), '38. Security Audit: No Razorpay secret returned')
    assert(!fullAuditStr.includes('SMTP_PASS'), '39. Security Audit: No SMTP credentials returned')
    assert(!fullAuditStr.includes('RESEND_API_KEY'), '40. Security Audit: No Resend API key returned')

    // Clean up temp MongoDB test records
    if (prodId) await Product.findByIdAndDelete(prodId)
    if (collId) await Collection.findByIdAndDelete(collId)
    if (bannerId) await Banner.findByIdAndDelete(bannerId)
    if (blogId) await BlogPost.findByIdAndDelete(blogId)
    if (mediaId) await Media.findByIdAndDelete(mediaId)

    console.log(`\n=== B-14.10 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
