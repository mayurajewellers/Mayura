import express from 'express'
import {
  getAdminConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
} from '../controllers/consultationController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/consultations — List consultations
router.get('/', getAdminConsultations)

// GET /api/v1/admin/consultations/:id — Get consultation detail
router.get('/:id', getConsultationById)

// PUT /api/v1/admin/consultations/:id — Update consultation status / notes
router.put('/:id', updateConsultation)

// DELETE /api/v1/admin/consultations/:id — Soft delete consultation
router.delete('/:id', deleteConsultation)

export default router
