import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Enquiry from '../src/models/Enquiry.js'
import Consultation from '../src/models/Consultation.js'
import NewsletterSubscriber from '../src/models/NewsletterSubscriber.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5101
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING ADMIN CUSTOMER OPERATIONS COMPREHENSIVE TEST SUITE (24 ASSERTIONS) ===\n')

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
    // 1. Prepare Admin & Customer Tokens
    let adminUser = await User.findOne({ role: 'ADMIN', isActive: true })
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10)
      adminUser = await User.create({
        name: 'Ops Admin',
        email: `ops_admin_${Date.now()}@example.com`,
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
        name: 'Ops Customer',
        email: `ops_cust_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'CUSTOMER',
      })
    }
    const custToken = signToken({ userId: custUser._id.toString(), role: custUser.role })

    // Create real test data in MongoDB for Enquiry, Consultation, Newsletter
    const testEnquiry = await Enquiry.create({
      name: 'Bhavya Agrawal',
      email: `bhavya_${Date.now()}@example.com`,
      phone: '+91 98350 99999',
      subject: 'Custom Bridal Polki Choker Enquiry',
      message: 'Can I customise the central ruby emerald pendant weight?',
      source: 'contact',
      status: 'NEW',
      isActive: true,
    })

    const testConsultation = await Consultation.create({
      name: 'Aditi Sharma',
      email: `aditi_${Date.now()}@example.com`,
      phone: '+91 98765 43210',
      preferredDate: new Date(Date.now() + 86400000 * 3),
      preferredTime: '3:00 pm',
      consultationType: 'video',
      message: 'Looking for antique temple jewellery bridal set',
      status: 'REQUESTED',
      isActive: true,
    })

    const testSubscriber = await NewsletterSubscriber.create({
      email: `insider_${Date.now()}@example.com`,
      status: 'SUBSCRIBED',
      source: 'footer',
      subscribedAt: new Date(),
      isActive: true,
    })

    // --- ENQUIRIES TESTS ---
    // 1. Guest -> 401
    const r1 = await fetch(`${BASE_URL}/api/v1/admin/enquiries`)
    assert(r1.status === 401, '1. Guest access to /api/v1/admin/enquiries returns 401 Unauthorized')

    // 2. CUSTOMER -> 403
    const r2 = await fetch(`${BASE_URL}/api/v1/admin/enquiries`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(r2.status === 403, '2. CUSTOMER role access to /api/v1/admin/enquiries returns 403 Forbidden')

    // 3. ADMIN -> 200
    const r3 = await fetch(`${BASE_URL}/api/v1/admin/enquiries`, { headers: adminHeaders }).then((r) => r.json())
    assert(r3.success === true && Array.isArray(r3.data?.enquiries), '3. ADMIN role access to /api/v1/admin/enquiries returns 200 OK')

    // 4. Admin receives real enquiry records
    assert(r3.data?.enquiries?.some((e) => e._id === testEnquiry._id.toString()), '4. Admin receives real enquiry records from MongoDB')

    // 5. Search works
    const r5 = await fetch(`${BASE_URL}/api/v1/admin/enquiries?search=Polki`, { headers: adminHeaders }).then((r) => r.json())
    assert(r5.success === true && r5.data?.enquiries?.some((e) => e.subject.includes('Polki')), '5. Enquiry search works by subject/name')

    // 6. Status filter works
    const r6 = await fetch(`${BASE_URL}/api/v1/admin/enquiries?status=NEW`, { headers: adminHeaders }).then((r) => r.json())
    assert(r6.success === true && r6.data?.enquiries?.every((e) => e.status === 'NEW'), '6. Enquiry status filter works (NEW)')

    // 7. Status update works
    const r7 = await fetch(`${BASE_URL}/api/v1/admin/enquiries/${testEnquiry._id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'RESOLVED', adminNotes: 'Contacted customer via WhatsApp' }),
    }).then((r) => r.json())
    assert(
      r7.success === true && r7.data?.enquiry?.status === 'RESOLVED' && r7.data?.enquiry?.adminNotes === 'Contacted customer via WhatsApp',
      '7. Admin can update enquiry status to RESOLVED with admin notes',
    )

    // --- CONSULTATIONS TESTS ---
    // 8. Guest -> 401
    const r8 = await fetch(`${BASE_URL}/api/v1/admin/consultations`)
    assert(r8.status === 401, '8. Guest access to /api/v1/admin/consultations returns 401 Unauthorized')

    // 9. CUSTOMER -> 403
    const r9 = await fetch(`${BASE_URL}/api/v1/admin/consultations`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(r9.status === 403, '9. CUSTOMER role access to /api/v1/admin/consultations returns 403 Forbidden')

    // 10. ADMIN -> 200
    const r10 = await fetch(`${BASE_URL}/api/v1/admin/consultations`, { headers: adminHeaders }).then((r) => r.json())
    assert(r10.success === true && Array.isArray(r10.data?.consultations), '10. ADMIN role access to /api/v1/admin/consultations returns 200 OK')

    // 11. Admin receives real consultation records
    assert(r10.data?.consultations?.some((c) => c._id === testConsultation._id.toString()), '11. Admin receives real consultation records')

    // 12. Consultation search works
    const r12 = await fetch(`${BASE_URL}/api/v1/admin/consultations?search=Aditi`, { headers: adminHeaders }).then((r) => r.json())
    assert(r12.success === true && r12.data?.consultations?.some((c) => c.name.includes('Aditi')), '12. Consultation search works by customer name')

    // 13. Consultation status filter works
    const r13 = await fetch(`${BASE_URL}/api/v1/admin/consultations?status=REQUESTED`, { headers: adminHeaders }).then((r) => r.json())
    assert(r13.success === true && r13.data?.consultations?.every((c) => c.status === 'REQUESTED'), '13. Consultation status filter works (REQUESTED)')

    // 14. Consultation status update works
    const r14 = await fetch(`${BASE_URL}/api/v1/admin/consultations/${testConsultation._id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'CONFIRMED' }),
    }).then((r) => r.json())
    assert(r14.success === true && r14.data?.consultation?.status === 'CONFIRMED', '14. Admin can update consultation status to CONFIRMED')

    // --- NEWSLETTER TESTS ---
    // 15. Guest -> 401
    const r15 = await fetch(`${BASE_URL}/api/v1/admin/insiders`)
    assert(r15.status === 401, '15. Guest access to /api/v1/admin/insiders returns 401 Unauthorized')

    // 16. CUSTOMER -> 403
    const r16 = await fetch(`${BASE_URL}/api/v1/admin/insiders`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(r16.status === 403, '16. CUSTOMER role access to /api/v1/admin/insiders returns 403 Forbidden')

    // 17. ADMIN -> 200
    const r17 = await fetch(`${BASE_URL}/api/v1/admin/insiders`, { headers: adminHeaders }).then((r) => r.json())
    assert(r17.success === true && Array.isArray(r17.data?.subscribers), '17. ADMIN role access to /api/v1/admin/insiders returns 200 OK')

    // 18. Admin receives real subscribers
    assert(r17.data?.subscribers?.some((s) => s._id === testSubscriber._id.toString()), '18. Admin receives real newsletter subscribers')

    // 19. Newsletter search works
    const r19 = await fetch(`${BASE_URL}/api/v1/admin/insiders?search=${testSubscriber.email}`, { headers: adminHeaders }).then((r) => r.json())
    assert(r19.success === true && r19.data?.subscribers?.some((s) => s.email === testSubscriber.email), '19. Newsletter search works by email')

    // 20. Newsletter status filter works
    const r20 = await fetch(`${BASE_URL}/api/v1/admin/insiders?status=SUBSCRIBED`, { headers: adminHeaders }).then((r) => r.json())
    assert(r20.success === true && r20.data?.subscribers?.every((s) => s.status === 'SUBSCRIBED'), '20. Newsletter status filter works (SUBSCRIBED)')

    // 21. Supported mutation works (UNSUBSCRIBE / REACTIVATE)
    const r21 = await fetch(`${BASE_URL}/api/v1/admin/insiders/${testSubscriber._id}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'UNSUBSCRIBED' }),
    }).then((r) => r.json())
    assert(r21.success === true && r21.data?.subscriber?.status === 'UNSUBSCRIBED', '21. Admin can update subscriber status to UNSUBSCRIBED')

    // --- DATABASE / API / UI CONSISTENCY ---
    // 22. Enquiry count consistency
    const mongoEnquiryCount = await Enquiry.countDocuments({ isActive: true })
    const apiEnquiryCount = r3.data?.pagination?.total
    assert(mongoEnquiryCount === apiEnquiryCount, `22. MongoDB active enquiry count (${mongoEnquiryCount}) matches API total (${apiEnquiryCount})`)

    // 23. Consultation count consistency
    const mongoConsultationCount = await Consultation.countDocuments({ isActive: true })
    const apiConsultationCount = r10.data?.pagination?.total
    assert(
      mongoConsultationCount === apiConsultationCount,
      `23. MongoDB active consultation count (${mongoConsultationCount}) matches API total (${apiConsultationCount})`,
    )

    // 24. Newsletter subscriber count consistency
    const mongoSubscriberCount = await NewsletterSubscriber.countDocuments({ isActive: true })
    const apiSubscriberCount = r17.data?.pagination?.total
    assert(
      mongoSubscriberCount === apiSubscriberCount,
      `24. MongoDB active subscriber count (${mongoSubscriberCount}) matches API total (${apiSubscriberCount})`,
    )

    // Cleanup test records
    await Enquiry.findByIdAndDelete(testEnquiry._id)
    await Consultation.findByIdAndDelete(testConsultation._id)
    await NewsletterSubscriber.findByIdAndDelete(testSubscriber._id)

    console.log(`\n=== ADMIN CUSTOMER OPERATIONS TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
