import express from 'express'
import { getHomepage } from '../controllers/homepageController.js'

const router = express.Router()

/**
 * Public Homepage Routes
 */

// GET /api/v1/homepage — Get active homepage sections in displayOrder
router.get('/', getHomepage)

export default router
