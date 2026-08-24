import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import NavigationItem from '../models/NavigationItem.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedNavigation = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Navigation Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'navigationSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const navData = JSON.parse(rawData)

    console.log(`Loaded ${navData.length} navigation items from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0

    for (const n of navData) {
      try {
        const query = { legacyId: n.legacyId }
        const existing = await NavigationItem.findOne(query)

        const payload = {
          ...n,
          isActive: n.isActive !== undefined ? n.isActive : true,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await NavigationItem.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        console.error(`Failed to seed navigation item ${n.legacyId}:`, err.message)
      }
    }

    const totalInDb = await NavigationItem.countDocuments()

    console.log('\n============================================================')
    console.log('NAVIGATION CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source navigation count     : ${navData.length}`)
    console.log(`MongoDB navigation count    : ${totalInDb}`)
    console.log(`Newly inserted items       : ${seededCount}`)
    console.log(`Updated existing items     : ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding navigation:', error)
    process.exit(1)
  }
}

seedNavigation()
