import express from 'express'
import { getNavigation } from '../controllers/navigationController.js'

const router = express.Router()

// GET /api/v1/navigation — Public navigation items
router.get('/', getNavigation)

export default router
