import express from 'express'
import { createConsultation } from '../controllers/consultationController.js'

const router = express.Router()

// POST /api/v1/consultations — Public consultation request
router.post('/', createConsultation)

export default router
