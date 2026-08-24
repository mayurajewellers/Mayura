import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5097
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.7 AUTOMATED ADMIN DASHBOARD TEST SUITE ===\n')

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
    // 1. Prepare Authorization Users
    let adminUser = await User.findOne({ role: 'ADMIN', isActive: true })
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10)
      adminUser = await User.create({
        name: 'Test Admin B14-7',
        email: `admin_b14_7_${Date.now()}@example.com`,
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
        name: 'Test Customer B14-7',
        email: `cust_b14_7_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'CUSTOMER',
      })
    }
    const custToken = signToken({ userId: custUser._id.toString(), role: custUser.role })

    // --- 1. Authorization Checks ---
    const rGuest = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`)
    assert(rGuest.status === 401, '1. Guest access to GET /api/v1/admin/dashboard/overview returns 401 Unauthorized')

    const rCust = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`, {
      headers: { Authorization: `Bearer ${custToken}` },
    })
    assert(rCust.status === 403, '2. CUSTOMER role access to GET /api/v1/admin/dashboard/overview returns 403 Forbidden')

    const rAdminOverview = await fetch(`${BASE_URL}/api/v1/admin/dashboard/overview`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminOverview.success === true && rAdminOverview.data?.revenue !== undefined, '3. ADMIN role can access GET /api/v1/admin/dashboard/overview')

    // --- 2. Revenue Time-Series Endpoint ---
    const rRevenue = await fetch(`${BASE_URL}/api/v1/admin/dashboard/revenue?range=30d`, { headers: adminHeaders }).then((r) => r.json())
    assert(rRevenue.success === true && Array.isArray(rRevenue.data?.dailyBreakdown), '4. GET /api/v1/admin/dashboard/revenue returns daily breakdown')

    // --- 3. Orders Breakdown Endpoint ---
    const rOrders = await fetch(`${BASE_URL}/api/v1/admin/dashboard/orders`, { headers: adminHeaders }).then((r) => r.json())
    assert(rOrders.success === true && rOrders.data?.totalOrders !== undefined, '5. GET /api/v1/admin/dashboard/orders returns order statistics')

    // --- 4. Top Selling Products Endpoint ---
    const rTopProds = await fetch(`${BASE_URL}/api/v1/admin/dashboard/products/top`, { headers: adminHeaders }).then((r) => r.json())
    assert(rTopProds.success === true && Array.isArray(rTopProds.data?.topProducts), '6. GET /api/v1/admin/dashboard/products/top returns top products')

    // --- 5. Recent Activity Endpoint ---
    const rRecent = await fetch(`${BASE_URL}/api/v1/admin/dashboard/recent`, { headers: adminHeaders }).then((r) => r.json())
    assert(rRecent.success === true && Array.isArray(rRecent.data?.orders), '7. GET /api/v1/admin/dashboard/recent returns activity feed')

    // --- 6. Security Audit (No secrets or passwordHashes exposed) ---
    const jsonStr = JSON.stringify(rAdminOverview) + JSON.stringify(rRecent)
    const containsPasswordHash = jsonStr.includes('passwordHash')
    assert(!containsPasswordHash, '8. Dashboard response does not expose passwordHash fields')

    console.log(`\n=== B-14.7 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
