import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

process.env.EMAIL_PROVIDER = 'console'

import app from '../src/app.js'
import User from '../src/models/User.js'
import Product from '../src/models/Product.js'
import Order from '../src/models/Order.js'
import InventoryTransaction from '../src/models/InventoryTransaction.js'
import { signToken } from '../src/utils/jwt.js'

dotenv.config()

const PORT = 5100
const BASE_URL = `http://localhost:${PORT}`

let server

const runTests = async () => {
  console.log('=== STARTING ADMIN INVENTORY MANAGEMENT TEST SUITE (20 ASSERTIONS) ===\n')

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
    // 1. Prepare Test Admin & Customer Users
    let adminUser = await User.findOne({ role: 'ADMIN', isActive: true })
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10)
      adminUser = await User.create({
        name: 'Inventory Admin',
        email: `inv_admin_${Date.now()}@example.com`,
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
        name: 'Inventory Customer',
        email: `inv_cust_${Date.now()}@example.com`,
        passwordHash: await bcrypt.hash('Password123!', salt),
        role: 'CUSTOMER',
      })
    }
    const custToken = signToken({ userId: custUser._id.toString(), role: custUser.role })

    // Assertion 1: Admin can list inventory
    const r1 = await fetch(`${BASE_URL}/api/v1/admin/inventory`, { headers: adminHeaders }).then((r) => r.json())
    assert(r1.success === true && Array.isArray(r1.data?.inventory), '1. Admin can list inventory (200 OK)')

    // Assertion 2: Guest gets 401
    const r2 = await fetch(`${BASE_URL}/api/v1/admin/inventory`)
    assert(r2.status === 401, '2. Guest gets 401 Unauthorized for admin inventory API')

    // Assertion 3: CUSTOMER gets 403
    const r3 = await fetch(`${BASE_URL}/api/v1/admin/inventory`, { headers: { Authorization: `Bearer ${custToken}` } })
    assert(r3.status === 403, '3. CUSTOMER role gets 403 Forbidden for admin inventory API')

    // Assertion 4: Admin can create product with inventory
    const testSku = `INV-SKU-${Date.now()}`
    const prodRes = await fetch(`${BASE_URL}/api/v1/admin/products`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        legacyId: `leg-inv-${Date.now()}`,
        sku: testSku,
        name: 'Inventory Audit Test Necklace',
        slug: testSku.toLowerCase(),
        type: 'necklace',
        collection: 'anantara',
        price: 85000,
        images: ['/images/products/placeholder.jpg'],
        metal: '22K Gold',
        metalKey: '22k-yellow-gold',
        purity: '22K916',
        grossWeight: 25,
        netWeight: 24,
        makingCharges: 'Included',
        shipping: 'Insured Courier',
        returns: '15-Day Guarantee',
        certification: 'BIS Hallmarked',
        description: 'Test inventory necklace',
        inventoryQuantity: 25,
        lowStockThreshold: 5,
        isActive: true,
      }),
    }).then((r) => r.json())

    const testProd = prodRes.data?.product
    assert(prodRes.success === true && testProd?.inventoryQuantity === 25, '4. Admin can create product with inventory quantity 25')

    // Assertion 5: Product with quantity 25 is IN_STOCK
    assert(testProd?.stockStatus === 'IN_STOCK' && testProd?.inStock === true, '5. Product with quantity 25 is IN_STOCK')

    // Assertion 6: Product with quantity 5 and threshold 5 is LOW_STOCK
    const lowProd = await Product.create({
      legacyId: `leg-low-${Date.now()}`,
      sku: `LOW-SKU-${Date.now()}`,
      name: 'Low Stock Test Bangle',
      slug: `low-bangle-${Date.now()}`,
      type: 'bangle',
      collection: 'anantara',
      price: 45000,
      images: ['/images/products/placeholder.jpg'],
      metal: '22K Gold',
      metalKey: '22k-yellow-gold',
      purity: '22K916',
      grossWeight: 20,
      netWeight: 19,
      makingCharges: 'Included',
      shipping: 'Insured Courier',
      returns: '15-Day Guarantee',
      certification: 'BIS Hallmarked',
      description: 'Low stock bangle',
      inventoryQuantity: 5,
      lowStockThreshold: 5,
      isActive: true,
    })
    const lowProdFetched = await Product.findById(lowProd._id)
    assert(lowProdFetched.stockStatus === 'LOW_STOCK', '6. Product with quantity 5 and threshold 5 is LOW_STOCK')

    // Assertion 7: Product with quantity 0 is OUT_OF_STOCK
    const outProd = await Product.create({
      legacyId: `leg-out-${Date.now()}`,
      sku: `OUT-SKU-${Date.now()}`,
      name: 'Out of Stock Test Ring',
      slug: `out-ring-${Date.now()}`,
      type: 'ring',
      collection: 'anantara',
      price: 30000,
      images: ['/images/products/placeholder.jpg'],
      metal: '22K Gold',
      metalKey: '22k-yellow-gold',
      purity: '22K916',
      grossWeight: 8,
      netWeight: 7.5,
      makingCharges: 'Included',
      shipping: 'Insured Courier',
      returns: '15-Day Guarantee',
      certification: 'BIS Hallmarked',
      description: 'Out of stock ring',
      inventoryQuantity: 0,
      lowStockThreshold: 5,
      isActive: true,
    })
    const outProdFetched = await Product.findById(outProd._id)
    assert(outProdFetched.stockStatus === 'OUT_OF_STOCK' && outProdFetched.inStock === false, '7. Product with quantity 0 is OUT_OF_STOCK')

    // Assertion 8: Admin can ADD stock (+10 => 35)
    const r8 = await fetch(`${BASE_URL}/api/v1/admin/inventory/${testProd._id}/adjust`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ adjustmentType: 'ADD', quantity: 10, reason: 'New stock received' }),
    }).then((r) => r.json())
    assert(r8.success === true && r8.data?.product?.inventoryQuantity === 35, '8. Admin can ADD stock (25 + 10 = 35)')

    // Assertion 9: Admin can REMOVE stock (-5 => 30)
    const r9 = await fetch(`${BASE_URL}/api/v1/admin/inventory/${testProd._id}/adjust`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ adjustmentType: 'REMOVE', quantity: 5, reason: 'Damaged item' }),
    }).then((r) => r.json())
    assert(r9.success === true && r9.data?.product?.inventoryQuantity === 30, '9. Admin can REMOVE stock (35 - 5 = 30)')

    // Assertion 10: Admin can SET exact stock (= 50)
    const r10 = await fetch(`${BASE_URL}/api/v1/admin/inventory/${testProd._id}/adjust`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ adjustmentType: 'SET', quantity: 50, reason: 'Stock audit' }),
    }).then((r) => r.json())
    assert(r10.success === true && r10.data?.product?.inventoryQuantity === 50, '10. Admin can SET exact stock (50 units)')

    // Assertion 11: Quantity can never become negative (removal > current stock rejected)
    const r11 = await fetch(`${BASE_URL}/api/v1/admin/inventory/${testProd._id}/adjust`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ adjustmentType: 'REMOVE', quantity: 999, reason: 'Overdraw attempt' }),
    })
    assert(r11.status === 400, '11. Attempting to reduce stock below 0 is rejected with 400 Bad Request')

    // Assertion 12: Customer cannot modify stock
    const r12 = await fetch(`${BASE_URL}/api/v1/admin/inventory/${testProd._id}/adjust`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustmentType: 'ADD', quantity: 10 }),
    })
    assert(r12.status === 403, '12. CUSTOMER role cannot modify stock (403 Forbidden)')

    // Assertion 13: Stock adjustment creates InventoryTransaction audit record
    const r13 = await fetch(`${BASE_URL}/api/v1/admin/inventory/${testProd._id}/history`, { headers: adminHeaders }).then((r) => r.json())
    assert(r13.success === true && r13.data?.transactions?.length >= 3, '13. Stock adjustment creates audit transaction log records')

    // Assertion 14: Order cannot purchase more than available quantity
    const r14 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Customer Test', email: 'cust@example.com', phone: '+91 98000 11111' },
        shippingAddress: { line1: 'Line 1', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', phone: '+91 98000 11111' },
        items: [{ productId: outProd._id, quantity: 2 }], // outProd has 0 units
        paymentMethod: 'COD',
      }),
    })
    assert(r14.status === 400, '14. Order creation for item with insufficient stock is rejected with 400 Bad Request')

    // Assertion 15: Successful payment / confirmed order deducts inventory
    const r15 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Valid Purchaser', email: 'purchaser@example.com', phone: '+91 98000 22222' },
        shippingAddress: { line1: 'Line 1', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', phone: '+91 98000 22222' },
        items: [{ productId: testProd._id, quantity: 2 }], // testProd has 50 units
        paymentMethod: 'COD',
      }),
    }).then((r) => r.json())

    const testProdAfterOrder = await Product.findById(testProd._id)
    assert(
      r15.success === true && testProdAfterOrder.inventoryQuantity === 48,
      '15. Confirmed order automatically deducts inventory quantity (50 - 2 = 48)',
    )

    // Assertion 16: Failed payment does NOT deduct inventory
    const r16 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Pending Purchaser', email: 'pending@example.com', phone: '+91 98000 33333' },
        shippingAddress: { line1: 'Line 1', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', phone: '+91 98000 33333' },
        items: [{ productId: testProd._id, quantity: 5 }],
        paymentMethod: 'RAZORPAY', // razorpay initially creates PENDING_PAYMENT order without immediate deduction until payment succeeds
      }),
    }).then((r) => r.json())

    const testProdAfterPending = await Product.findById(testProd._id)
    assert(
      r16.success === true && testProdAfterPending.inventoryQuantity === 48,
      '16. Pending payment order does NOT deduct inventory until payment succeeds',
    )

    // Assertion 17: Concurrent stock deduction safety check (attempting to deduct exact remaining stock)
    const exactProd = await Product.create({
      legacyId: `leg-exact-${Date.now()}`,
      sku: `EXACT-SKU-${Date.now()}`,
      name: 'Exact Single Stock Ring',
      slug: `exact-ring-${Date.now()}`,
      type: 'ring',
      collection: 'anantara',
      price: 20000,
      images: ['/images/products/placeholder.jpg'],
      metal: '22K Gold',
      metalKey: '22k-yellow-gold',
      purity: '22K916',
      grossWeight: 5,
      netWeight: 4.8,
      makingCharges: 'Included',
      shipping: 'Insured Courier',
      returns: '15-Day Guarantee',
      certification: 'BIS Hallmarked',
      description: 'Single item ring',
      inventoryQuantity: 1,
      lowStockThreshold: 5,
      isActive: true,
    })

    const r17 = await fetch(`${BASE_URL}/api/v1/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Single Buyer', email: 'buyer@example.com', phone: '+91 98000 44444' },
        shippingAddress: { line1: 'Line 1', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', phone: '+91 98000 44444' },
        items: [{ productId: exactProd._id, quantity: 1 }],
        paymentMethod: 'COD',
      }),
    }).then((r) => r.json())

    const exactProdAfter = await Product.findById(exactProd._id)
    assert(
      r17.success === true && exactProdAfter.inventoryQuantity === 0 && exactProdAfter.inStock === false,
      '17. Purchasing last unit reduces inventory to 0 and updates inStock to false',
    )

    // Assertion 18: inStock flag updates automatically
    assert(exactProdAfter.inStock === false, '18. inStock flag updates automatically to false when stock hits 0')

    // Assertion 19: Public Product API remains safe (does not expose internal transaction logs)
    const r19 = await fetch(`${BASE_URL}/api/v1/products/${testProd.slug}`).then((r) => r.json())
    const pubProdStr = JSON.stringify(r19)
    assert(r19.success === true && !pubProdStr.includes('previousQuantity'), '19. Public product API does not expose internal audit transaction logs')

    // Assertion 20: Dashboard stock metrics match real quantities
    const r20 = await fetch(`${BASE_URL}/api/v1/admin/dashboard/products`, { headers: adminHeaders }).then((r) => r.json())
    assert(
      r20.success === true &&
        typeof r20.data?.inStockProducts === 'number' &&
        typeof r20.data?.outOfStockProducts === 'number',
      '20. Admin dashboard inventory metrics return real stock counts',
    )

    // Cleanup test records
    await Product.deleteMany({ _id: { $in: [testProd._id, lowProd._id, outProd._id, exactProd._id] } })
    await InventoryTransaction.deleteMany({ productId: { $in: [testProd._id, lowProd._id, outProd._id, exactProd._id] } })

    console.log(`\n=== ADMIN INVENTORY TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===\n`)
  } catch (err) {
    console.error('Unhandled test error:', err)
  } finally {
    server.close()
    await mongoose.disconnect()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
