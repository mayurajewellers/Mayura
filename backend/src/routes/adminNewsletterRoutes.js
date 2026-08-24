import express from 'express'
import {
  getAdminSubscribers,
  getSubscriberById,
  updateSubscriber,
  deleteSubscriber,
} from '../controllers/newsletterController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/insiders — List subscribers
router.get('/', getAdminSubscribers)

// GET /api/v1/admin/insiders/:id — Get subscriber detail
router.get('/:id', getSubscriberById)

// PUT /api/v1/admin/insiders/:id — Update subscriber status
router.put('/:id', updateSubscriber)

// DELETE /api/v1/admin/insiders/:id — Soft delete subscriber
router.delete('/:id', deleteSubscriber)

export default router
