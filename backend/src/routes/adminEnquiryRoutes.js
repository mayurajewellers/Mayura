import express from 'express'
import {
  getAdminEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} from '../controllers/enquiryController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/enquiries — List enquiries
router.get('/', getAdminEnquiries)

// GET /api/v1/admin/enquiries/:id — Get enquiry detail
router.get('/:id', getEnquiryById)

// PUT /api/v1/admin/enquiries/:id — Update enquiry status / notes
router.put('/:id', updateEnquiry)

// DELETE /api/v1/admin/enquiries/:id — Soft delete enquiry
router.delete('/:id', deleteEnquiry)

export default router
