import express from 'express'
import {
  getAdminNavigation,
  createNavigationItem,
  getNavigationItemById,
  updateNavigationItem,
  deleteNavigationItem,
} from '../controllers/navigationController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/navigation — List navigation items
router.get('/', getAdminNavigation)

// POST /api/v1/admin/navigation — Create navigation item
router.post('/', createNavigationItem)

// GET /api/v1/admin/navigation/:id — Get navigation item by ID or legacyId
router.get('/:id', getNavigationItemById)

// PUT /api/v1/admin/navigation/:id — Update navigation item
router.put('/:id', updateNavigationItem)

// DELETE /api/v1/admin/navigation/:id — Soft delete navigation item
router.delete('/:id', deleteNavigationItem)

export default router
