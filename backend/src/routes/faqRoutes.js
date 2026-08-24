import express from 'express'
import { getFAQs } from '../controllers/faqController.js'

const router = express.Router()

// GET /api/v1/faqs — Public FAQs list
router.get('/', getFAQs)

export default router
