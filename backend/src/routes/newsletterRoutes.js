import express from 'express'
import { subscribe } from '../controllers/newsletterController.js'

const router = express.Router()

// POST /api/v1/insiders — Public newsletter subscription
router.post('/', subscribe)

export default router
