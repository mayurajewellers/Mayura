import express from 'express'
import {
  getAdminTestimonials,
  createTestimonial,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/testimonials — List testimonials
router.get('/', getAdminTestimonials)

// POST /api/v1/admin/testimonials — Create testimonial
router.post('/', createTestimonial)

// GET /api/v1/admin/testimonials/:id — Get testimonial by ID or legacyId
router.get('/:id', getTestimonialById)

// PUT /api/v1/admin/testimonials/:id — Update testimonial
router.put('/:id', updateTestimonial)

// DELETE /api/v1/admin/testimonials/:id — Soft delete testimonial
router.delete('/:id', deleteTestimonial)

export default router
