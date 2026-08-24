import jwt from 'jsonwebtoken'
import config from '../config/env.js'

/**
 * Sign a JWT with payload containing minimal user identity (userId, role)
 */
export const signToken = (payload, expiresIn = config.jwtExpiresIn) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn })
}

/**
 * Verify a JWT string and return parsed payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch (error) {
    return null
  }
}

export default {
  signToken,
  verifyToken,
}
