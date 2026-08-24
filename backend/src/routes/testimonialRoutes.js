import express from 'express'
import { getTestimonials } from '../controllers/testimonialController.js'

const router = express.Router()

// GET /api/v1/testimonials — Public testimonials list
router.get('/', getTestimonials)

export default router
