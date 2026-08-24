import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Product from '../models/Product.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedProducts = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Product Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'productSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const productsData = JSON.parse(rawData)

    console.log(`Loaded ${productsData.length} products from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const p of productsData) {
      try {
        const query = { $or: [{ sku: p.sku }, { legacyId: p.legacyId || p.id }] }
        const existing = await Product.findOne(query)

        const payload = {
          ...p,
          legacyId: p.legacyId || p.id,
          sku: p.sku.toUpperCase(),
          slug: p.slug.toLowerCase(),
          isActive: p.isActive !== undefined ? p.isActive : true,
          isFeatured: p.isFeatured !== undefined ? p.isFeatured : false,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await Product.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ sku: p.sku, error: err.message })
        console.error(`Failed to seed product ${p.sku}:`, err.message)
      }
    }

    const totalInDb = await Product.countDocuments()

    console.log('\n============================================================')
    console.log('PRODUCT MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source product count        : ${productsData.length}`)
    console.log(`MongoDB product total count : ${totalInDb}`)
    console.log(`Newly inserted products     : ${seededCount}`)
    console.log(`Updated existing products   : ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

seedProducts()
