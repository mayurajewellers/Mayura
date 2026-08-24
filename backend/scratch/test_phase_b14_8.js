import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import Collection from '../src/models/Collection.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5095
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING PHASE B-14.8 AUTOMATED PRODUCTS & COLLECTIONS TEST SUITE ===\n')

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
    // 1. Authorization checks
    let adminUser = await User.findOne({ role: 'ADMIN', isActive: true })
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10)
      adminUser = await User.create({
        name: 'Test Admin B14-8',
        email: `admin_b14_8_${Date.now()}@example.com`,
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
        name: 'Test Customer B14-8',
        email: `cust_b14_8_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'CUSTOMER',
      })
    }
    const custToken = signToken({ userId: custUser._id.toString(), role: custUser.role })

    // Guest rejection
    const rGuest = await fetch(`${BASE_URL}/api/v1/admin/products`)
    assert(rGuest.status === 401, '1. Guest access to GET /api/v1/admin/products returns 401 Unauthorized')

    // Customer rejection
    const rCust = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      headers: { Authorization: `Bearer ${custToken}` },
    })
    assert(rCust.status === 403, '2. CUSTOMER role access to GET /api/v1/admin/products returns 403 Forbidden')

    // 2. Admin List Products
    const rAdminProds = await fetch(`${BASE_URL}/api/v1/admin/products`, { headers: adminHeaders }).then((r) => r.json())
    assert(rAdminProds.success === true && Array.isArray(rAdminProds.data?.products), '3. ADMIN can list all products (active & inactive)')

    // 3. Admin Create Product
    const testSku = `MJTEST${Date.now()}`
    const rCreateProd = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        sku: testSku,
        name: 'Test B14-8 Gold Haram',
        type: 'Necklace',
        collection: 'anantara',
        metal: '22K Gold',
        metalKey: 'gold-22k',
        price: 75000,
        grossWeight: 22,
        netWeight: 21,
        inStock: true,
        isFeatured: true,
        isActive: true,
      }),
    }).then((r) => r.json())

    assert(rCreateProd.success === true && rCreateProd.data?.product?.sku === testSku, '4. ADMIN can create a new product')
    const createdProdId = rCreateProd.data?.product?._id

    // Duplicate SKU check
    const rDupProd = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        sku: testSku,
        name: 'Duplicate SKU Product',
        type: 'Necklace',
        collection: 'anantara',
        price: 50000,
      }),
    })
    assert(rDupProd.status === 409, '5. Duplicate product SKU is rejected with 409 Conflict')

    // 4. Admin Update Product
    const rUpdateProd = await fetch(`${BASE_URL}/api/v1/admin/products/${createdProdId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        price: 80000,
        name: 'Updated Test B14-8 Gold Haram',
      }),
    }).then((r) => r.json())

    assert(rUpdateProd.success === true && rUpdateProd.data?.product?.price === 80000, '6. ADMIN can update existing product')

    // 5. Admin Soft Delete Product
    const rDelProd = await fetch(`${BASE_URL}/api/v1/admin/products/${createdProdId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then((r) => r.json())

    assert(rDelProd.success === true, '7. ADMIN can soft-delete product (DELETE /api/v1/admin/products/:id)')

    const softDeletedProd = await Product.findById(createdProdId)
    assert(softDeletedProd && softDeletedProd.isActive === false, '8. Soft-deleted product has isActive set to false')

    // 6. Admin Create Collection
    const testSlug = `b14-8-test-collection-${Date.now()}`
    const rCreateCol = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Test B14-8 Collection',
        slug: testSlug,
        tagline: 'Luxury Heritage',
        displayOrder: 99,
        isActive: true,
      }),
    }).then((r) => r.json())

    assert(rCreateCol.success === true && rCreateCol.data?.collection?.slug === testSlug, '9. ADMIN can create a new collection')
    const createdColId = rCreateCol.data?.collection?._id

    // Duplicate Collection Slug check
    const rDupCol = await fetch(`${BASE_URL}/api/v1/admin/collections`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Duplicate Collection',
        slug: testSlug,
      }),
    })
    assert(rDupCol.status === 409, '10. Duplicate collection slug is rejected with 409 Conflict')

    // 7. Admin Soft Delete Collection
    const rDelCol = await fetch(`${BASE_URL}/api/v1/admin/collections/${createdColId}`, {
      method: 'DELETE',
      headers: adminHeaders,
    }).then((r) => r.json())

    assert(rDelCol.success === true, '11. ADMIN can soft-delete collection')

    // 8. Verify public collections API hides soft-deleted collection
    const rPubCols = await fetch(`${BASE_URL}/api/v1/collections`).then((r) => r.json())
    const foundInPublic = rPubCols.data?.collections?.some((c) => c.slug === testSlug)
    assert(!foundInPublic, '12. Public GET /api/v1/collections hides soft-deleted collection')

    // Clean up test documents
    if (createdProdId) await Product.findByIdAndDelete(createdProdId)
    if (createdColId) await Collection.findByIdAndDelete(createdColId)

    console.log(`\n=== B-14.8 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
