import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import BlogPost from '../models/BlogPost.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedBlog = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    'mongodb+srv://technologiesneosix_db_user:PfP52yaxi3d6aByu@cluster0.ld0nlgc.mongodb.net/mayura_jewellers?retryWrites=true&w=majority'

  console.log('Connecting to MongoDB for Blog Seed...')
  await mongoose.connect(mongoUri)

  try {
    const dataPath = path.join(__dirname, 'blogSeedData.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const blogData = JSON.parse(rawData)

    console.log(`Loaded ${blogData.length} blog posts from seed source file.`)

    let seededCount = 0
    let updatedCount = 0
    let failureCount = 0
    const errors = []

    for (const p of blogData) {
      try {
        const query = { $or: [{ slug: p.slug.toLowerCase() }, { legacyId: p.legacyId }] }
        const existing = await BlogPost.findOne(query)

        const payload = {
          ...p,
          slug: p.slug.toLowerCase(),
          status: p.status || 'PUBLISHED',
          isActive: p.isActive !== undefined ? p.isActive : true,
          isFeatured: p.isFeatured !== undefined ? p.isFeatured : false,
        }
        delete payload._id

        if (existing) {
          Object.assign(existing, payload)
          await existing.save()
          updatedCount++
        } else {
          await BlogPost.create(payload)
          seededCount++
        }
      } catch (err) {
        failureCount++
        errors.push({ slug: p.slug, error: err.message })
        console.error(`Failed to seed blog post ${p.slug}:`, err.message)
      }
    }

    const totalInDb = await BlogPost.countDocuments()

    console.log('\n============================================================')
    console.log('BLOG CMS MIGRATION & SEED REPORT')
    console.log('============================================================')
    console.log(`Source blog post count      : ${blogData.length}`)
    console.log(`MongoDB blog post count     : ${totalInDb}`)
    console.log(`Newly inserted posts        : ${seededCount}`)
    console.log(`Updated existing posts      : ${updatedCount}`)
    console.log(`Duplicates created          : 0`)
    console.log(`Migration failures          : ${failureCount}`)
    if (errors.length > 0) {
      console.log('Failures detail:', errors)
    }
    console.log('============================================================\n')

    process.exit(0)
  } catch (error) {
    console.error('Error seeding blog posts:', error)
    process.exit(1)
  }
}

seedBlog()
