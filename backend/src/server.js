import app from './app.js'
import config, { validateEnv } from './config/env.js'
import connectDB from './config/db.js'

// Validate environment variables on boot
validateEnv()

// Initialize database connection
connectDB()

// Start Express HTTP Server
const server = app.listen(config.port, () => {
  console.log(`[SERVER] Mayura Jewellers API running in ${config.nodeEnv} mode on port ${config.port}`)
  console.log(`[SERVER] Health check endpoint: http://localhost:${config.port}/api/v1/health`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[UNHANDLED REJECTION] ${err.name}: ${err.message}`)
  server.close(() => process.exit(1))
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[UNCAUGHT EXCEPTION] ${err.name}: ${err.message}`)
  process.exit(1)
})
