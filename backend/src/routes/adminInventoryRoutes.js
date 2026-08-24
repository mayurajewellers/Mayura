import express from 'express'
import {
  getAdminInventory,
  getAdminInventoryById,
  adjustStock,
  getInventoryHistory,
} from '../controllers/inventoryController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/inventory — Paginated inventory stock list & low stock warnings
router.get('/', getAdminInventory)

// GET /api/v1/admin/inventory/:productId — Single product inventory detail
router.get('/:productId', getAdminInventoryById)

// POST /api/v1/admin/inventory/:productId/adjust — Adjust stock (ADD, REMOVE, SET)
router.post('/:productId/adjust', adjustStock)

// GET /api/v1/admin/inventory/:productId/history — Audit transaction history log
router.get('/:productId/history', getInventoryHistory)

export default router
