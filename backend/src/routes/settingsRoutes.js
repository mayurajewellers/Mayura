import express from 'express'
import { getSettings } from '../controllers/settingsController.js'

const router = express.Router()

// GET /api/v1/settings — Public site settings
router.get('/', getSettings)

export default router
