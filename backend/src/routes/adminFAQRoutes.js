import express from 'express'
import {
  getAdminFAQs,
  createFAQ,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faqController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/faqs — List FAQs
router.get('/', getAdminFAQs)

// POST /api/v1/admin/faqs — Create FAQ
router.post('/', createFAQ)

// GET /api/v1/admin/faqs/:id — Get FAQ by ID or legacyId
router.get('/:id', getFAQById)

// PUT /api/v1/admin/faqs/:id — Update FAQ
router.put('/:id', updateFAQ)

// DELETE /api/v1/admin/faqs/:id — Soft delete FAQ
router.delete('/:id', deleteFAQ)

export default router
