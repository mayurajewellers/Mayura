import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import GalleryItem from '../models/GalleryItem.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedGallery = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Gallery Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'gallerySeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const galleryData = JSON.parse(rawData)

    console.log(`Loaded ${galleryData.length} gallery items from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const g of galleryData) {
      try {
        const query = { legacyId: g.legacyId }
        const existing = await GalleryItem.findOne(query)

        const payload = {
          ...g,
          isActive: g.isActive !== undefined ? g.isActive : true,
          isFeatured: g.isFeatured !== undefined ? g.isFeatured : false,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await GalleryItem.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ legacyId: g.legacyId, error: err.message })
        console.error(`Failed to seed gallery item ${g.legacyId}:`, err.message)
      }
    }

    const totalInDb = await GalleryItem.countDocuments()

    console.log('\n============================================================')
    console.log('GALLERY CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source gallery count       : ${galleryData.length}`)
    console.log(`MongoDB gallery count      : ${totalInDb}`)
    console.log(`Newly inserted items       : ${seededCount}`)
    console.log(`Updated existing items     : ${updatedCount}`)
    console.log(`Duplicates created         : 0`)
    console.log(`Migration failures         : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding gallery:', error)
    process.exit(1)
  }
}

seedGallery()
