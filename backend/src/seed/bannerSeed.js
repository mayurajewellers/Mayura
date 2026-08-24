import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Banner from '../models/Banner.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedBanners = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Banner Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'bannerSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const bannersData = JSON.parse(rawData)

    console.log(`Loaded ${bannersData.length} banners from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const b of bannersData) {
      try {
        const query = { slug: b.slug.toLowerCase() }
        const existing = await Banner.findOne(query)

        const payload = {
          ...b,
          slug: b.slug.toLowerCase(),
          isActive: b.isActive !== undefined ? b.isActive : true,
          isFeatured: b.isFeatured !== undefined ? b.isFeatured : false,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await Banner.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ slug: b.slug, error: err.message })
        console.error(`Failed to seed banner ${b.slug}:`, err.message)
      }
    }

    const totalInDb = await Banner.countDocuments()

    console.log('\n============================================================')
    console.log('BANNERS & MEDIA CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source banner count         : ${bannersData.length}`)
    console.log(`MongoDB banner total count  : ${totalInDb}`)
    console.log(`Newly inserted banners      : ${seededCount}`)
    console.log(`Updated existing banners    : ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding banners:', error)
    process.exit(1)
  }
}

seedBanners()
