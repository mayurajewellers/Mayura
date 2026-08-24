import express from 'express'
import { getAdminSettings, updateAdminSettings } from '../controllers/settingsController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/settings — Get admin settings
router.get('/', getAdminSettings)

// PUT /api/v1/admin/settings — Update singleton site settings
router.put('/', updateAdminSettings)

export default router
