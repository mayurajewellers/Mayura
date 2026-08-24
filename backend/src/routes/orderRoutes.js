import express from 'express'
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
} from '../controllers/orderController.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * Customer: Create order (Authentication Required)
 * POST /api/v1/orders
 */
router.post('/', authenticate, createOrder)

/**
 * Customer: Get customer order history
 * GET /api/v1/orders
 */
router.get('/', authenticate, getCustomerOrders)

/**
 * Public & Customer: Get order details by ID / orderNumber
 * GET /api/v1/orders/:id
 */
router.get('/:id', optionalAuthenticate, getOrderById)

export default router
