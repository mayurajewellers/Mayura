import { Router } from 'express'
import { adminLogin, getAdminMe } from '../controllers/adminAuthController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = Router()

/**
 * Admin Authentication Routes (/api/v1/admin/auth)
 */
router.post('/login', adminLogin)
router.get('/me', authenticate, requireAdmin, getAdminMe)

export default router
