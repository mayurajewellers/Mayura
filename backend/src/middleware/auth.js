import User from '../models/User.js'
import { verifyToken } from '../utils/jwt.js'

/**
 * Authentication Middleware
 * Validates Bearer JWT, fetches fresh user from DB, checks isActive status.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Authorization header.',
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.',
      })
    }

    // Load current user from DB to ensure fresh status and role
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found. Authentication rejected.',
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been disabled. Please contact support.',
      })
    }

    // Attach authenticated user to request
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

/**
 * Optional Authentication Middleware
 * If valid Bearer JWT is provided, populates req.user. If no header, continues safely.
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = verifyToken(token)
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId)
        if (user && user.isActive) {
          req.user = user
        }
      }
    }
  } catch (error) {
    // Ignore error for optional auth
  }
  next()
}

export default authenticate
