import express from 'express'
import {
  createCollection,
  getAdminCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
} from '../controllers/collectionController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

/**
 * Admin Collection Routes
 * All routes require authentication AND ADMIN role.
 */
router.use(authenticate, requireAdmin)

// POST /api/v1/admin/collections — Create collection
router.post('/', createCollection)

// GET /api/v1/admin/collections — List all collections (active & inactive)
router.get('/', getAdminCollections)

// GET /api/v1/admin/collections/:id — Get collection by ID, legacyId, or slug
router.get('/:id', getCollectionById)

// PUT /api/v1/admin/collections/:id — Update collection by ID
router.put('/:id', updateCollection)

// DELETE /api/v1/admin/collections/:id — Soft delete (deactivate) collection by ID
router.delete('/:id', deleteCollection)

export default router
