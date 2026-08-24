import express from 'express'
import { createEnquiry } from '../controllers/enquiryController.js'

const router = express.Router()

// POST /api/v1/enquiries — Public enquiry submission
router.post('/', createEnquiry)

export default router
