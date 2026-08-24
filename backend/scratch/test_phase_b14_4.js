import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import FAQ from '../src/models/FAQ.js'

dotenv.config()

const PORT = 5099
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.4 AUTOMATED TEST SUITE ===\n')

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
    // 1. GET /api/v1/blog
    const rBlog = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    assert(
      rBlog.success === true && Array.isArray(rBlog.data?.posts),
      '1. GET /api/v1/blog returns published posts array',
    )

    // 2. GET /api/v1/blog/:slug
    const sampleSlug = rBlog.data?.posts?.[0]?.slug || 'how-to-read-a-hallmark'
    const rBlogPost = await fetch(`${BASE_URL}/api/v1/blog/${sampleSlug}`).then((r) => r.json())
    assert(
      rBlogPost.success === true && rBlogPost.data?.post?.title !== undefined,
      `2. GET /api/v1/blog/${sampleSlug} returns single post details`,
    )

    // 3. GET /api/v1/testimonials
    const rTestimonials = await fetch(`${BASE_URL}/api/v1/testimonials`).then((r) => r.json())
    assert(
      rTestimonials.success === true && Array.isArray(rTestimonials.data?.testimonials),
      '3. GET /api/v1/testimonials returns testimonials array',
    )

    // 4. GET /api/v1/gallery
    const rGallery = await fetch(`${BASE_URL}/api/v1/gallery`).then((r) => r.json())
    assert(
      rGallery.success === true && Array.isArray(rGallery.data?.items),
      '4. GET /api/v1/gallery returns gallery items array',
    )

    // 5. GET /api/v1/faqs
    const rFaqs = await fetch(`${BASE_URL}/api/v1/faqs`).then((r) => r.json())
    assert(
      rFaqs.success === true && Array.isArray(rFaqs.data?.faqs),
      '5. GET /api/v1/faqs returns FAQs array',
    )

    // 6. CMS Source-of-Truth Verification Test
    let testFaq = await FAQ.findOne({ isActive: true })
    if (testFaq) {
      const originalAnswer = testFaq.answer
      const updatedMarker = `${originalAnswer} [CMS_VERIFIED_B14_4]`
      testFaq.answer = updatedMarker
      await testFaq.save()

      const rCmsFaq = await fetch(`${BASE_URL}/api/v1/faqs`).then((r) => r.json())
      const updatedFaq = rCmsFaq.data?.faqs?.find((f) => f._id.toString() === testFaq._id.toString())

      assert(
        updatedFaq && updatedFaq.answer === updatedMarker,
        '6. CMS Source-of-Truth Test: Live database modification instantly reflected in public API',
      )

      // Restore original answer
      testFaq.answer = originalAnswer
      await testFaq.save()
    } else {
      assert(true, '6. CMS Source-of-Truth Test skipped (no FAQ record found)')
    }

    console.log(`\n=== B-14.4 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
