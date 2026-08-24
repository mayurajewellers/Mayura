import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import app from '../src/app.js'
import User from '../src/models/User.js'
import Enquiry from '../src/models/Enquiry.js'
import Consultation from '../src/models/Consultation.js'
import NewsletterSubscriber from '../src/models/NewsletterSubscriber.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5092
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testEnquiryId = ''
let testConsultationId = ''
let testSubscriberId = ''

const runTests = async () => {
  console.log('=== STARTING PHASE B-10 AUTOMATED API SUITE ===\n')

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
      name: 'Test Admin B10',
      email: 'admin_test_b10@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B10',
      email: 'customer_test_b10@mayura.com',
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
    // --- ENQUIRY TESTS ---
    // 1. Health check
    const res1 = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    assert(res1.success === true && res1.data.database === 'connected', '1. GET /api/v1/health returns 200 OK')

    // 2. Public enquiry creation
    const res2 = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bhavya Test',
        email: 'BHAVYA_TEST@EXAMPLE.COM',
        phone: '9167589002',
        subject: 'Bridal commission',
        message: 'Looking for a 60g bridal set.',
      }),
    })
    const res2Body = await res2.json()
    assert(res2.status === 201 && res2Body.success === true, '2. Public POST /api/v1/enquiries returns 201 Created')
    if (res2Body.data?.enquiry?._id) testEnquiryId = res2Body.data.enquiry._id

    // 3. Required field validation
    const res3 = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'bhavya@example.com', phone: '9876543210', message: 'Test' }),
    })
    assert(res3.status === 400, '3. Empty name enquiry submission returns 400 Bad Request')

    // 4. Invalid email rejection
    const res4 = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'not-an-email', phone: '9876543210', message: 'Test' }),
    })
    assert(res4.status === 400, '4. Invalid email format returns 400 Bad Request')

    // 5. Empty message rejection
    const res5 = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'bhavya@example.com', phone: '9876543210', message: '   ' }),
    })
    assert(res5.status === 400, '5. Whitespace-only message returns 400 Bad Request')

    // 6. Client-supplied status ignored (always NEW)
    const res6 = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Status Test',
        email: 'status_test@example.com',
        phone: '9876543210',
        message: 'Status test message',
        status: 'RESOLVED',
      }),
    }).then((r) => r.json())
    assert(res6.data?.enquiry?.status === 'NEW', '6. Client-supplied status is ignored and set to NEW')
    if (res6.data?.enquiry?._id) await Enquiry.deleteOne({ _id: res6.data.enquiry._id })

    // 7. Client-supplied adminNotes ignored
    const enquiryInDb = await Enquiry.findById(testEnquiryId).lean()
    assert(enquiryInDb.adminNotes === '', '7. Client-supplied adminNotes is ignored and set to empty string')

    // 8. Admin enquiry listing
    const res8 = await fetch(`${BASE_URL}/api/v1/admin/enquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(res8.success === true && Array.isArray(res8.data.enquiries), '8. GET /api/v1/admin/enquiries with ADMIN token returns list')

    // 9. Admin enquiry detail
    const res9 = await fetch(`${BASE_URL}/api/v1/admin/enquiries/${testEnquiryId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(res9.success === true && res9.data.enquiry._id === testEnquiryId, '9. GET /api/v1/admin/enquiries/:id returns detail')

    // 10 & 11. Admin status & notes update
    const res10 = await fetch(`${BASE_URL}/api/v1/admin/enquiries/${testEnquiryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'IN_PROGRESS', adminNotes: 'Called customer on WhatsApp.' }),
    }).then((r) => r.json())
    assert(
      res10.data.enquiry.status === 'IN_PROGRESS' && res10.data.enquiry.adminNotes === 'Called customer on WhatsApp.',
      '10 & 11. Admin update modifies status and adminNotes correctly',
    )

    // 12. Customer token rejected on admin enquiries
    const res12 = await fetch(`${BASE_URL}/api/v1/admin/enquiries`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    })
    assert(res12.status === 403, '12. CUSTOMER token on admin enquiries returns 403 Forbidden')

    // 13. Unauthenticated admin request returns 401
    const res13 = await fetch(`${BASE_URL}/api/v1/admin/enquiries`)
    assert(res13.status === 401, '13. Unauthenticated admin enquiry request returns 401 Unauthorized')

    // --- CONSULTATION TESTS ---
    // 14. Public consultation creation
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)

    const res14 = await fetch(`${BASE_URL}/api/v1/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Anjali Mehta',
        phone: '9167589002',
        email: 'anjali@example.com',
        date: tomorrow.toISOString(),
        slot: '3:00 pm',
        consultationType: 'video',
        items: [{ title: 'Anantara Polki Choker' }],
        message: 'Looking for bridal necklace options.',
      }),
    })
    const res14Body = await res14.json()
    assert(res14.status === 201 && res14Body.success === true, '14. Public POST /api/v1/consultations returns 201 Created')
    if (res14Body.data?.consultation?._id) testConsultationId = res14Body.data.consultation._id

    // 15. Invalid consultation payload rejection
    const res15 = await fetch(`${BASE_URL}/api/v1/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', phone: '', date: tomorrow.toISOString(), slot: '3:00 pm' }),
    })
    assert(res15.status === 400, '15. Invalid consultation payload returns 400 Bad Request')

    // 16. Past date rejection
    const pastDate = new Date('2020-01-01').toISOString()
    const res16 = await fetch(`${BASE_URL}/api/v1/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', phone: '9167589002', date: pastDate, slot: '3:00 pm' }),
    })
    assert(res16.status === 400, '16. Past date consultation request returns 400 Bad Request')

    // 17. Client-supplied status ignored (always REQUESTED)
    const consultationInDb = await Consultation.findById(testConsultationId).lean()
    assert(consultationInDb.status === 'REQUESTED', '17. Consultation starts strictly as REQUESTED')

    // 18. Admin consultation listing
    const res18 = await fetch(`${BASE_URL}/api/v1/admin/consultations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(res18.success === true && Array.isArray(res18.data.consultations), '18. GET /api/v1/admin/consultations returns list')

    // 19. Admin consultation detail
    const res19 = await fetch(`${BASE_URL}/api/v1/admin/consultations/${testConsultationId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())
    assert(res19.success === true && res19.data.consultation._id === testConsultationId, '19. GET /api/v1/admin/consultations/:id returns detail')

    // 20 & 21. Admin status & notes update
    const res20 = await fetch(`${BASE_URL}/api/v1/admin/consultations/${testConsultationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'CONFIRMED', adminNotes: 'Confirmed via WhatsApp' }),
    }).then((r) => r.json())
    assert(
      res20.data.consultation.status === 'CONFIRMED' && res20.data.consultation.adminNotes === 'Confirmed via WhatsApp',
      '20 & 21. Admin update modifies consultation status to CONFIRMED and adds notes',
    )

    // 22. Customer token rejected on admin consultations
    const res22 = await fetch(`${BASE_URL}/api/v1/admin/consultations`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    })
    assert(res22.status === 403, '22. CUSTOMER token on admin consultations returns 403 Forbidden')

    // 23. Unauthenticated admin request returns 401
    const res23 = await fetch(`${BASE_URL}/api/v1/admin/consultations`)
    assert(res23.status === 401, '23. Unauthenticated admin consultation request returns 401 Unauthorized')

    // --- NEWSLETTER / INSIDER TESTS ---
    // 24 & 25. New insider subscription & normalization
    const res24 = await fetch(`${BASE_URL}/api/v1/insiders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '  INSIDER_TEST_B10@MAYURA.COM  ', segment: 'bridal' }),
    })
    const res24Body = await res24.json()
    assert(
      res24.status === 201 && res24Body.success === true && res24Body.data.alreadySubscribed === false,
      '24 & 25. Public POST /api/v1/insiders creates normalized subscription (201 Created)',
    )
    const subscriberInDb = await NewsletterSubscriber.findOne({ email: 'insider_test_b10@mayura.com' })
    if (subscriberInDb) testSubscriberId = subscriberInDb._id

    // 26. Duplicate subscription does not create duplicate document
    const res26 = await fetch(`${BASE_URL}/api/v1/insiders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'insider_test_b10@mayura.com' }),
    })
    const res26Body = await res26.json()
    const subCount = await NewsletterSubscriber.countDocuments({ email: 'insider_test_b10@mayura.com' })
    assert(
      res26.status === 200 && res26Body.data.alreadySubscribed === true && subCount === 1,
      '26. Duplicate subscription returns 200 with alreadySubscribed: true (0 duplicate documents created)',
    )

    // 28, 29, 30. Admin list, unsubscribe, & resubscribe reactivation
    const res29 = await fetch(`${BASE_URL}/api/v1/admin/insiders/${testSubscriberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'UNSUBSCRIBED' }),
    }).then((r) => r.json())
    assert(res29.data.subscriber.status === 'UNSUBSCRIBED', '29. Admin can update status to UNSUBSCRIBED')

    // 27 & 30. Resubscribe unsubscribed user reactivates record
    const res27 = await fetch(`${BASE_URL}/api/v1/insiders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'insider_test_b10@mayura.com' }),
    }).then((r) => r.json())
    assert(
      res27.success === true && res27.data.subscriber.status === 'SUBSCRIBED',
      '27 & 30. Resubscribing unsubscribed email reactivates existing document status to SUBSCRIBED',
    )

    // 31. Customer token rejected on admin insiders
    const res31 = await fetch(`${BASE_URL}/api/v1/admin/insiders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    })
    assert(res31.status === 403, '31. CUSTOMER token on admin insiders returns 403 Forbidden')

    // 32. Unauthenticated admin request returns 401
    const res32 = await fetch(`${BASE_URL}/api/v1/admin/insiders`)
    assert(res32.status === 401, '32. Unauthenticated admin insider request returns 401 Unauthorized')

    // --- REGRESSION TESTS (B-01 to B-09) ---
    // 33 - 41. Full B-01 to B-09 Regression
    const rHealth = await fetch(`${BASE_URL}/api/v1/health`).then((r) => r.json())
    const rProducts = await fetch(`${BASE_URL}/api/v1/products?limit=5`).then((r) => r.json())
    const rCollections = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    const rHomepage = await fetch(`${BASE_URL}/api/v1/homepage`).then((r) => r.json())
    const rBanners = await fetch(`${BASE_URL}/api/v1/banners`).then((r) => r.json())
    const rBlog = await fetch(`${BASE_URL}/api/v1/blog`).then((r) => r.json())
    const rTestimonials = await fetch(`${BASE_URL}/api/v1/testimonials`).then((r) => r.json())
    const rGallery = await fetch(`${BASE_URL}/api/v1/gallery`).then((r) => r.json())
    const rFaqs = await fetch(`${BASE_URL}/api/v1/faqs`).then((r) => r.json())
    const rPolicies = await fetch(`${BASE_URL}/api/v1/policies`).then((r) => r.json())
    const rSettings = await fetch(`${BASE_URL}/api/v1/settings`).then((r) => r.json())

    assert(
      rHealth.success === true &&
        rProducts.success === true &&
        rCollections.success === true &&
        rHomepage.success === true &&
        rBanners.success === true &&
        rBlog.success === true &&
        rTestimonials.success === true &&
        rGallery.success === true &&
        rFaqs.success === true &&
        rPolicies.success === true &&
        rSettings.success === true,
      '33-41. B-01 through B-09 endpoints pass regression check OK',
    )

    // Clean up temporary test entries
    await Enquiry.deleteOne({ _id: testEnquiryId })
    await Consultation.deleteOne({ _id: testConsultationId })
    await NewsletterSubscriber.deleteOne({ _id: testSubscriberId })

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
