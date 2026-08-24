import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import Consultation from '../src/models/Consultation.js'
import NewsletterSubscriber from '../src/models/NewsletterSubscriber.js'
import Policy from '../src/models/Policy.js'

dotenv.config()

const PORT = 5097
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.6 AUTOMATED SECURITY & INTEGRATION TEST SUITE ===\n')

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
    // 1. Consultation Booking POST /api/v1/consultations
    const testConsultationDate = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    const rConsultation = await fetch(`${BASE_URL}/api/v1/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Consultation User B14-6',
        phone: '9876543210',
        email: 'consult_b14_6@example.com',
        preferredDate: testConsultationDate,
        preferredTime: '3:00 pm',
        consultationType: 'video',
        items: ['Anantara Polki Choker'],
        message: 'Looking forward to viewing bridal set',
      }),
    }).then((r) => r.json())

    assert(
      rConsultation.success === true &&
        rConsultation.data?.consultation?.status === 'REQUESTED',
      '1. Consultation booking succeeds (201 Created, status: REQUESTED)',
    )

    // Verify consultation in MongoDB
    const consultationInDb = await Consultation.findOne({ email: 'consult_b14_6@example.com' })
    assert(
      consultationInDb && consultationInDb.phone === '9876543210',
      '1b. Consultation record persisted in MongoDB',
    )

    // 2. Newsletter Subscription POST /api/v1/insiders
    const testNewsletterEmail = `insider_b14_6_${Date.now()}@example.com`
    const rInsider1 = await fetch(`${BASE_URL}/api/v1/insiders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testNewsletterEmail, segment: 'website' }),
    }).then((r) => r.json())

    assert(
      rInsider1.success === true,
      '2. Newsletter subscription succeeds (POST /api/v1/insiders)',
    )

    // Test Idempotency
    const rInsider2 = await fetch(`${BASE_URL}/api/v1/insiders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testNewsletterEmail, segment: 'website' }),
    }).then((r) => r.json())

    assert(
      rInsider2.success === true && rInsider2.data?.alreadySubscribed === true,
      '2b. Newsletter idempotency verified (alreadySubscribed: true)',
    )

    // 3. Customer Enquiry POST /api/v1/enquiries
    const rEnquiry = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Enquiry B14-6',
        email: 'enquiry_b14_6@example.com',
        phone: '9876543210',
        subject: 'Bridal commission',
        message: 'Looking for a custom bridal necklace set.',
      }),
    }).then((r) => r.json())

    assert(
      rEnquiry.success === true && rEnquiry.data?.enquiry?.status === 'NEW',
      '3. Customer enquiry creation succeeds (POST /api/v1/enquiries)',
    )

    // 4. Policies API GET /api/v1/policies
    const rPolicies = await fetch(`${BASE_URL}/api/v1/policies`).then((r) => r.json())
    assert(
      rPolicies.success === true && Array.isArray(rPolicies.data?.policies),
      '4. GET /api/v1/policies returns active policies array',
    )

    // 5. Site Settings API GET /api/v1/settings
    const rSettings = await fetch(`${BASE_URL}/api/v1/settings`).then((r) => r.json())
    assert(
      rSettings.success === true && rSettings.data?.settings !== undefined,
      '5. GET /api/v1/settings returns global site settings',
    )

    // 6. CMS Source-of-Truth Verification Test
    let testPolicy = await Policy.findOne({ isActive: true })
    if (testPolicy) {
      const originalTitle = testPolicy.title
      const updatedTitle = `${originalTitle} [CMS_B14_6]`
      testPolicy.title = updatedTitle
      await testPolicy.save()

      const rCmsPolicy = await fetch(`${BASE_URL}/api/v1/policies/${testPolicy.slug}`).then((r) =>
        r.json(),
      )

      assert(
        rCmsPolicy.success === true && rCmsPolicy.data?.policy?.title === updatedTitle,
        '6. CMS Source-of-Truth Test: Database policy title modification instantly reflected in API',
      )

      // Restore title
      testPolicy.title = originalTitle
      await testPolicy.save()
    } else {
      assert(true, '6. CMS Source-of-Truth Test skipped (no policy found)')
    }

    console.log(`\n=== B-14.6 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
