import { getDatabaseStatus } from '../config/db.js'
import config from '../config/env.js'

/**
 * @desc    Health Check Endpoint
 * @route   GET /api/v1/health
 * @access  Public
 */
export const getHealth = (_req, res) => {
  const dbStatus = getDatabaseStatus()

  res.status(200).json({
    success: true,
    message: 'Mayura Jewellers API is running',
    data: {
      database: dbStatus,
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  })
}
