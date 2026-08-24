import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import SiteSettings from '../models/SiteSettings.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedSettings = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Site Settings Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'settingsSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const settingsData = JSON.parse(rawData)

    const payload = settingsData[0] || {}
    payload.key = 'main'
    delete payload._id

    let existing = await SiteSettings.findOne({ key: 'main' })
    let inserted = 0
    let updated = 0

    if (existing) {
      Object.assign(existing, payload)
      await existing.save()
      updated = 1
    } else {
      await SiteSettings.create(payload)
      inserted = 1
    }

    const totalInDb = await SiteSettings.countDocuments()

    console.log('\n============================================================')
    console.log('SITE SETTINGS CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source settings records     : 1`)
    console.log(`MongoDB settings count      : ${totalInDb}`)
    console.log(`Newly inserted settings     : ${inserted}`)
    console.log(`Updated existing settings   : ${updated}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : 0`)
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding site settings:', error)
    process.exit(1)
  }
}

seedSettings()
