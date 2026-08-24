import express from 'express'
import {
  getAdminPolicies,
  createPolicy,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} from '../controllers/policyController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/policies — List policies
router.get('/', getAdminPolicies)

// POST /api/v1/admin/policies — Create policy
router.post('/', createPolicy)

// GET /api/v1/admin/policies/:id — Get policy by ID or slug
router.get('/:id', getPolicyById)

// PUT /api/v1/admin/policies/:id — Update policy
router.put('/:id', updatePolicy)

// DELETE /api/v1/admin/policies/:id — Soft delete policy
router.delete('/:id', deletePolicy)

export default router
