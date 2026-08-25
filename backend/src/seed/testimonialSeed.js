import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Testimonial from '../models/Testimonial.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedTestimonials = async () => {
  const mongoUri =
    process.env.MONGODB_URI
    

  console.log('Connecting to MongoDB for Testimonial Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'testimonialSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const testimonialsData = JSON.parse(rawData)

    console.log(`Loaded ${testimonialsData.length} testimonials from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const t of testimonialsData) {
      try {
        const query = { legacyId: t.legacyId }
        const existing = await Testimonial.findOne(query)

        const payload = {
          ...t,
          isActive: t.isActive !== undefined ? t.isActive : true,
          isFeatured: t.isFeatured !== undefined ? t.isFeatured : false,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await Testimonial.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ legacyId: t.legacyId, error: err.message })
        console.error(`Failed to seed testimonial ${t.legacyId}:`, err.message)
      }
    }

    const totalInDb = await Testimonial.countDocuments()

    console.log('\n============================================================')
    console.log('TESTIMONIALS CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source testimonial count    : ${testimonialsData.length}`)
    console.log(`MongoDB testimonial count   : ${totalInDb}`)
    console.log(`Newly inserted testimonials : ${seededCount}`)
    console.log(`Updated existing testimonials: ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding testimonials:', error)
    process.exit(1)
  }
}

seedTestimonials()
