import dotenv from 'dotenv'

dotenv.config()

/**
 * Validate and export environment configurations.
 */
export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mayura_jewellers',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret_mayura_jewellers_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminName: process.env.ADMIN_NAME || 'Mayura Admin',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@mayurajewellers.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'AdminSecurePassword123!',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
}

/**
 * Validate critical environment variables on startup.
 */
export const validateEnv = () => {
  const missing = []
  if (!process.env.MONGODB_URI && config.nodeEnv === 'production') {
    missing.push('MONGODB_URI')
  }
  if (!process.env.JWT_SECRET && config.nodeEnv === 'production') {
    missing.push('JWT_SECRET')
  }

  if (missing.length > 0) {
    console.error(`[ENV ERROR] Missing required environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }
}

export default config
