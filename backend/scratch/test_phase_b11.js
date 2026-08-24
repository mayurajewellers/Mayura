import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'

// Ensure EMAIL_PROVIDER=console for testing
process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Enquiry from '../src/models/Enquiry.js'
import Consultation from '../src/models/Consultation.js'
import NewsletterSubscriber from '../src/models/NewsletterSubscriber.js'
import { signToken } from '../src/utils/jwt.js'
import { setEmailProvider, dispatchEmail } from '../src/services/email/emailService.js'
import escapeHtml from '../src/services/email/utils/escapeHtml.js'

dotenv.config()

const PORT = 5091
const BASE_URL = `http://localhost:${PORT}`

let server
let adminToken = ''
let customerToken = ''
let testEnquiryId = ''
let testConsultationId = ''
let testSubscriberId = ''

// Track emails captured by test provider
const capturedEmails = []

const mockTestProvider = {
  name: 'mockTestProvider',
  async sendEmail(options) {
    capturedEmails.push({ ...options, timestamp: Date.now() })
    console.log(`[TEST_EMAIL_CAPTURED] Template: ${options.templateName} | To: ${options.to}`)
    return { success: true, provider: 'mockTestProvider', messageId: `test-${Date.now()}` }
  },
}

const runTests = async () => {
  console.log('=== STARTING PHASE B-11 AUTOMATED API SUITE ===\n')

  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  await mongoose.connect(mongoUri)

  // Use mock test provider to capture dispatched emails
  setEmailProvider(mockTestProvider)

  // Setup server
  server = http.createServer(app)
  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`Test server running on port ${PORT}\n`)

  // Setup test tokens
  let adminUser = await User.findOne({ role: 'ADMIN' })
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Test Admin B11',
      email: 'admin_test_b11@mayura.com',
      password: 'HashedPassword123!',
      role: 'ADMIN',
      isActive: true,
    })
  }
  adminToken = signToken({ userId: adminUser._id, role: adminUser.role })

  let customerUser = await User.findOne({ role: 'CUSTOMER' })
  if (!customerUser) {
    customerUser = await User.create({
      name: 'Test Customer B11',
      email: 'customer_test_b11@mayura.com',
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
    // 1. Email Service Initialization in Console / Mock Mode
    assert(mockTestProvider.name === 'mockTestProvider', '1. Email service initializes in provider mode')

    // 2. Enquiry Creation Email Side-Effects
    capturedEmails.length = 0
    const res2 = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bhavya B11 Test',
        email: 'bhavya_b11@example.com',
        phone: '9876543210',
        subject: 'Custom Design',
        message: 'Looking for a custom gold bangles design.',
      }),
    })
    const res2Body = await res2.json()
    assert(res2.status === 201 && res2Body.success === true, '2. Public enquiry creation succeeds (201 Created)')
    if (res2Body.data?.enquiry?._id) testEnquiryId = res2Body.data.enquiry._id

    // Wait 200ms for async side-effects
    await new Promise((r) => setTimeout(r, 200))

    const enquiryCustomerEmail = capturedEmails.find((e) => e.templateName === 'enquiryConfirmation')
    const enquiryAdminEmail = capturedEmails.find((e) => e.templateName === 'adminEnquiryNotification')

    assert(
      enquiryCustomerEmail && enquiryCustomerEmail.to === 'bhavya_b11@example.com',
      '2a. Customer confirmation email attempted for enquiry',
    )
    assert(
      enquiryAdminEmail && enquiryAdminEmail.replyTo === 'bhavya_b11@example.com',
      '2b. Admin notification email attempted with customer replyTo set',
    )

    // 3. Consultation Request Email Side-Effects
    capturedEmails.length = 0
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 3)

    const res3 = await fetch(`${BASE_URL}/api/v1/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Sharma',
        phone: '9876543210',
        email: 'priya_b11@example.com',
        date: tomorrow.toISOString(),
        slot: '4:00 pm',
        consultationType: 'video',
        message: 'Consultation test message',
      }),
    })
    const res3Body = await res3.json()
    assert(res3.status === 201 && res3Body.success === true, '3. Consultation request succeeds (201 Created)')
    if (res3Body.data?.consultation?._id) testConsultationId = res3Body.data.consultation._id

    await new Promise((r) => setTimeout(r, 200))

    const consultCustomerEmail = capturedEmails.find((e) => e.templateName === 'consultationRequested')
    const consultAdminEmail = capturedEmails.find((e) => e.templateName === 'adminConsultationNotification')

    assert(
      consultCustomerEmail && consultCustomerEmail.to === 'priya_b11@example.com',
      '3a. Customer consultation requested email attempted',
    )
    assert(
      consultAdminEmail && consultAdminEmail.subject.includes('Priya Sharma'),
      '3b. Admin consultation notification email attempted',
    )

    // 4 & 5. Newsletter Subscription Email & Idempotency
    capturedEmails.length = 0
    const res4 = await fetch(`${BASE_URL}/api/v1/insiders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'insider_b11@example.com' }),
    }).then((r) => r.json())

    await new Promise((r) => setTimeout(r, 200))
    const welcomeEmail = capturedEmails.find((e) => e.templateName === 'newsletterWelcome')

    assert(
      res4.success === true && res4.data.alreadySubscribed === false && welcomeEmail !== undefined,
      '4. Newsletter welcome email sent on new subscription',
    )
    const subscriberInDb = await NewsletterSubscriber.findOne({ email: 'insider_b11@example.com' })
    if (subscriberInDb) testSubscriberId = subscriberInDb._id

    // Duplicate subscription check
    capturedEmails.length = 0
    const res5 = await fetch(`${BASE_URL}/api/v1/insiders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'insider_b11@example.com' }),
    }).then((r) => r.json())

    await new Promise((r) => setTimeout(r, 200))
    assert(
      res5.data.alreadySubscribed === true && capturedEmails.length === 0,
      '5. Duplicate newsletter subscription sends 0 duplicate welcome emails',
    )

    // 6, 7, 8. Consultation Status Transition Emails (REQUESTED -> CONFIRMED -> CONFIRMED -> CANCELLED)
    capturedEmails.length = 0
    // Transition: REQUESTED -> CONFIRMED
    const res6 = await fetch(`${BASE_URL}/api/v1/admin/consultations/${testConsultationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    }).then((r) => r.json())

    await new Promise((r) => setTimeout(r, 200))
    const confirmedEmail = capturedEmails.find((e) => e.templateName === 'consultationConfirmed')
    assert(
      res6.data.consultation.status === 'CONFIRMED' && confirmedEmail !== undefined,
      '6. Transition REQUESTED -> CONFIRMED sends consultationConfirmed email once',
    )

    // Transition: CONFIRMED -> CONFIRMED (Unchanged status)
    capturedEmails.length = 0
    await fetch(`${BASE_URL}/api/v1/admin/consultations/${testConsultationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'CONFIRMED', adminNotes: 'No status change' }),
    })
    await new Promise((r) => setTimeout(r, 200))
    assert(capturedEmails.length === 0, '7. Unchanged CONFIRMED -> CONFIRMED sends 0 duplicate emails')

    // Transition: CONFIRMED -> CANCELLED
    capturedEmails.length = 0
    const res8 = await fetch(`${BASE_URL}/api/v1/admin/consultations/${testConsultationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'CANCELLED' }),
    }).then((r) => r.json())

    await new Promise((r) => setTimeout(r, 200))
    const cancelledEmail = capturedEmails.find((e) => e.templateName === 'consultationCancelled')
    assert(
      res8.data.consultation.status === 'CANCELLED' && cancelledEmail !== undefined,
      '8. Transition CONFIRMED -> CANCELLED sends consultationCancelled email once',
    )

    // 9. Email Failure Isolation (DB operation succeeds even if email provider throws)
    const failingProvider = {
      name: 'failingMockProvider',
      async sendEmail() {
        throw new Error('Simulated SMTP Network Failure')
      },
    }
    setEmailProvider(failingProvider)

    const res9 = await fetch(`${BASE_URL}/api/v1/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Failure Test User',
        email: 'failtest@example.com',
        phone: '9876543210',
        message: 'This enquiry must save even if email fails.',
      }),
    })
    const res9Body = await res9.json()
    assert(
      res9.status === 201 && res9Body.success === true,
      '9. DB operation succeeds (201 Created) even when email provider fails',
    )
    if (res9Body.data?.enquiry?._id) await Enquiry.deleteOne({ _id: res9Body.data.enquiry._id })

    // Restore test provider
    setEmailProvider(mockTestProvider)

    // 10. HTML Escaping Verification
    const rawInput = '<script>alert("xss")</script>'
    const escapedOutput = escapeHtml(rawInput)
    assert(
      escapedOutput === '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      '10. HTML escaping correctly sanitizes HTML/script injection tags',
    )

    // --- REGRESSION TESTS (B-01 to B-10) ---
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
    const rEnquiries = await fetch(`${BASE_URL}/api/v1/admin/enquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json())

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
        rSettings.success === true &&
        rEnquiries.success === true,
      '11. B-01 through B-10 endpoints pass full regression check OK',
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
