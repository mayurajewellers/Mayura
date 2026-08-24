import { Router } from 'express'
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js'
import authenticate from '../middleware/auth.js'

const router = Router()

/**
 * Customer Authentication Routes (/api/v1/auth)
 */
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authenticate, getMe)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router
