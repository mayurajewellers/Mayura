import express from 'express'
import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrder,
} from '../controllers/orderController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = express.Router()

// Apply admin authentication to all routes in this router
router.use(authenticate, requireAdmin)

/**
 * Admin: Get all orders (paginated, searchable, status filter)
 * GET /api/v1/admin/orders
 */
router.get('/', getAdminOrders)

/**
 * Admin: Get order details by ID
 * GET /api/v1/admin/orders/:id
 */
router.get('/:id', getAdminOrderById)

/**
 * Admin: Update order status, tracking, or notes
 * PUT /api/v1/admin/orders/:id
 */
router.put('/:id', updateAdminOrder)

export default router
