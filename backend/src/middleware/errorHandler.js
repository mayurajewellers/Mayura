import config from '../config/env.js'

/**
 * Centralized API Error Handling Middleware
 */
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500
  const message = err.message || 'Internal Server Error'

  // Log full error stack internally in non-production environments
  if (config.nodeEnv !== 'production') {
    console.error(`[ERROR Handler] ${statusCode} - ${message}\nStack: ${err.stack}`)
  } else {
    console.error(`[ERROR Handler] ${statusCode} - ${message}`)
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
  })
}

export default errorHandler
