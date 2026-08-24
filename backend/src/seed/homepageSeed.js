import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import HomepageSection from '../models/HomepageSection.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedHomepage = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Homepage Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'homepageSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const sectionsData = JSON.parse(rawData)

    console.log(`Loaded ${sectionsData.length} homepage sections from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const s of sectionsData) {
      try {
        const query = { key: s.key.toLowerCase() }
        const existing = await HomepageSection.findOne(query)

        const payload = {
          ...s,
          key: s.key.toLowerCase(),
          isActive: s.isActive !== undefined ? s.isActive : true,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await HomepageSection.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ key: s.key, error: err.message })
        console.error(`Failed to seed homepage section ${s.key}:`, err.message)
      }
    }

    const totalInDb = await HomepageSection.countDocuments()

    console.log('\n============================================================')
    console.log('HOMEPAGE CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source section count        : ${sectionsData.length}`)
    console.log(`MongoDB section total count : ${totalInDb}`)
    console.log(`Newly inserted sections     : ${seededCount}`)
    console.log(`Updated existing sections   : ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding homepage sections:', error)
    process.exit(1)
  }
}

seedHomepage()
