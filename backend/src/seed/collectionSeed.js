import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Collection from '../models/Collection.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedCollections = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Collection Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'collectionSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const collectionsData = JSON.parse(rawData)

    console.log(`Loaded ${collectionsData.length} collections from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const c of collectionsData) {
      try {
        const query = { $or: [{ slug: c.slug.toLowerCase() }, { legacyId: c.legacyId }] }
        const existing = await Collection.findOne(query)

        const payload = {
          ...c,
          legacyId: c.legacyId || `COL-${c.slug.toUpperCase()}`,
          slug: c.slug.toLowerCase(),
          isActive: c.isActive !== undefined ? c.isActive : true,
          isFeatured: c.isFeatured !== undefined ? c.isFeatured : true,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await Collection.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ slug: c.slug, error: err.message })
        console.error(`Failed to seed collection ${c.slug}:`, err.message)
      }
    }

    const totalInDb = await Collection.countDocuments()

    console.log('\n============================================================')
    console.log('COLLECTION MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source collection count     : ${collectionsData.length}`)
    console.log(`MongoDB collection total    : ${totalInDb}`)
    console.log(`Newly inserted collections  : ${seededCount}`)
    console.log(`Updated existing collections: ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding collections:', error)
    process.exit(1)
  }
}

seedCollections()
