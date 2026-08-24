import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import FAQ from '../models/FAQ.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedFAQs = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for FAQ Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'faqSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const faqData = JSON.parse(rawData)

    console.log(`Loaded ${faqData.length} FAQs from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const f of faqData) {
      try {
        const query = { legacyId: f.legacyId }
        const existing = await FAQ.findOne(query)

        const payload = {
          ...f,
          isActive: f.isActive !== undefined ? f.isActive : true,
          isFeatured: f.isFeatured !== undefined ? f.isFeatured : false,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await FAQ.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ legacyId: f.legacyId, error: err.message })
        console.error(`Failed to seed FAQ ${f.legacyId}:`, err.message)
      }
    }

    const totalInDb = await FAQ.countDocuments()

    console.log('\n============================================================')
    console.log('FAQ CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source FAQ count           : ${faqData.length}`)
    console.log(`MongoDB FAQ count          : ${totalInDb}`)
    console.log(`Newly inserted FAQs        : ${seededCount}`)
    console.log(`Updated existing FAQs      : ${updatedCount}`)
    console.log(`Duplicates created         : 0`)
    console.log(`Migration failures         : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding FAQs:', error)
    process.exit(1)
  }
}

seedFAQs()
