import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import config, { validateEnv } from '../config/env.js'
import connectDB from '../config/db.js'
import User from '../models/User.js'

/**
 * Idempotent Admin Seed Script
 * Executed via: npm run seed:admin
 */
const seedAdmin = async () => {
  try {
    validateEnv()
    await connectDB()

    const name = config.adminName
    const email = config.adminEmail?.trim().toLowerCase()
    const password = config.adminPassword

    if (!name || !email || !password) {
      console.error('[SEED ERROR] ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured in environment variables.')
      process.exit(1)
    }

    // Check if an ADMIN user already exists in the database
    const existingAdmin = await User.findOne({ role: 'ADMIN' })

    if (existingAdmin) {
      console.log(`[SEED INFO] Admin user already exists (${existingAdmin.email}). No duplicate admin created.`)
      await mongoose.connection.close()
      process.exit(0)
    }

    // Check if user with target admin email exists as customer
    const userWithEmail = await User.findOne({ email })
    if (userWithEmail) {
      // Upgrade existing account to ADMIN role securely
      const salt = await bcrypt.genSalt(10)
      userWithEmail.passwordHash = await bcrypt.hash(password, salt)
      userWithEmail.role = 'ADMIN'
      userWithEmail.isActive = true
      userWithEmail.isEmailVerified = true
      await userWithEmail.save()
      console.log(`[SEED SUCCESS] Existing user updated to ADMIN role (${email}).`)
    } else {
      // Create new ADMIN user
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      await User.create({
        name,
        email,
        passwordHash,
        role: 'ADMIN', // Hardcoded ADMIN role for seed script
        isActive: true,
        isEmailVerified: true,
      })

      console.log(`[SEED SUCCESS] Admin user created successfully (${email}).`)
    }

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error(`[SEED ERROR] Failed to seed admin user: ${error.message}`)
    process.exit(1)
  }
}

seedAdmin()
