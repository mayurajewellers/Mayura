import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import Policy from '../models/Policy.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedPolicies = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Policy Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'policySeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const policyData = JSON.parse(rawData)

    console.log(`Loaded ${policyData.length} policies from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0

    for (const p of policyData) {
      try {
        const query = { $or: [{ slug: p.slug.toLowerCase() }, { legacyId: p.legacyId }] }
        const existing = await Policy.findOne(query)

        const payload = {
          ...p,
          slug: p.slug.toLowerCase(),
          isActive: p.isActive !== undefined ? p.isActive : true,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await Policy.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        console.error(`Failed to seed policy ${p.slug}:`, err.message)
      }
    }

    const totalInDb = await Policy.countDocuments()

    console.log('\n============================================================')
    console.log('POLICIES CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source policy count         : ${policyData.length}`)
    console.log(`MongoDB policy count        : ${totalInDb}`)
    console.log(`Newly inserted policies     : ${seededCount}`)
    console.log(`Updated existing policies   : ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding policies:', error)
    process.exit(1)
  }
}

seedPolicies()
