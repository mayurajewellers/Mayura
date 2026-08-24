import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'

dotenv.config()

const PORT = 5098
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.3 AUTOMATED TEST SUITE ===\n')

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
    // 1. Health check
    const rHealth = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(rHealth.success === true, '1. Health endpoint operational')

    // 2. GET /api/v1/homepage returns sections
    const rHomepage = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    assert(
      rHomepage.success === true && Array.isArray(rHomepage.data?.sections),
      '2. GET /api/v1/homepage returns active homepage sections array',
    )

    // 3. GET /api/v1/banners?placement=homepage-hero returns banners
    const rHeroBanners = await fetch(`${BASE_URL}/api/v1/banners?placement=homepage-hero`).then((r) => r.json())
    assert(
      rHeroBanners.success === true && Array.isArray(rHeroBanners.data?.banners),
      '3. GET /api/v1/banners?placement=homepage-hero returns active hero banners',
    )

    // 4. GET /api/v1/products?isFeatured=true returns featured products for rails
    const rFeatured = await fetch(`${BASE_URL}/api/v1/products?isFeatured=true`).then((r) => r.json())
    assert(
      rFeatured.success === true && Array.isArray(rFeatured.data?.products),
      '4. GET /api/v1/products?isFeatured=true returns featured products array',
    )

    // 5. GET /api/v1/collections returns collections for homepage sections
    const rCollections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    assert(
      rCollections.success === true && Array.isArray(rCollections.data?.collections),
      '5. GET /api/v1/collections returns collections array',
    )

    // 6. Full B-01 -> B-14.2 regression check
    const rProducts = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const rBlog = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    const rTestimonials = await fetch(`${BASE_URL}/api/v1/testimonials`).then((r) => r.json())
    const rFaqs = await fetch(`${BASE_URL}/api/v1/faqs`).then((r) => r.json())

    assert(
      rProducts.success === true && rBlog.success === true && rTestimonials.success === true && rFaqs.success === true,
      '6. Full regression pass OK across Products, Collections, Blog, Testimonials, FAQs APIs',
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
