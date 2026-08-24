import mongoose from 'mongoose'
import config from './env.js'

/**
 * Maps Mongoose connection readyState codes to readable strings.
 */
export const getDatabaseStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  return states[mongoose.connection.readyState] || 'unknown'
}

/**
 * Establish MongoDB connection with Mongoose.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri)
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`)
  } catch (error) {
    console.error(`[DATABASE ERROR] MongoDB Connection Failed: ${error.message}`)
    // Do not crash silently — exit with error in production or log explicitly
    if (config.nodeEnv === 'production') {
      process.exit(1)
    }
  }
}

// Global connection event listeners for logging
mongoose.connection.on('disconnected', () => {
  console.warn('[DATABASE WARNING] MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
  console.error(`[DATABASE ERROR] MongoDB event error: ${err.message}`)
})

export default connectDB
