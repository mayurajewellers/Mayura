import express from 'express'
import {
  getOverview,
  getRevenue,
  getOrders,
  getCustomers,
  getProducts,
  getTopProducts,
  getCollections,
  getEnquiries,
  getConsultations,
  getNewsletter,
  getRecent,
  getRecentOrders,
  getRecentEnquiries,
  getRecentConsultations,
  getRecentCustomers,
} from '../controllers/dashboardController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/admin.js'

const router = express.Router()

// Protect all admin dashboard endpoints with authenticate + requireAdmin
router.use(authenticate, requireAdmin)

/**
 * High-level Overview Summary
 * GET /api/v1/admin/dashboard/overview
 */
router.get('/overview', getOverview)

/**
 * Revenue Analytics
 * GET /api/v1/admin/dashboard/revenue
 */
router.get('/revenue', getRevenue)

/**
 * Order Analytics
 * GET /api/v1/admin/dashboard/orders
 */
router.get('/orders', getOrders)

/**
 * Customer Analytics
 * GET /api/v1/admin/dashboard/customers
 */
router.get('/customers', getCustomers)

/**
 * Top Selling Products
 * GET /api/v1/admin/dashboard/products/top
 */
router.get('/products/top', getTopProducts)

/**
 * Product Analytics
 * GET /api/v1/admin/dashboard/products
 */
router.get('/products', getProducts)

/**
 * Collection Analytics
 * GET /api/v1/admin/dashboard/collections
 */
router.get('/collections', getCollections)

/**
 * Enquiry Analytics
 * GET /api/v1/admin/dashboard/enquiries
 */
router.get('/enquiries', getEnquiries)

/**
 * Consultation Analytics
 * GET /api/v1/admin/dashboard/consultations
 */
router.get('/consultations', getConsultations)

/**
 * Newsletter Subscriber Analytics
 * GET /api/v1/admin/dashboard/newsletter
 */
router.get('/newsletter', getNewsletter)

/**
 * Combined Recent Operational Activity
 * GET /api/v1/admin/dashboard/recent
 */
router.get('/recent', getRecent)

/**
 * Compact Recent Operational Sub-lists
 */
router.get('/recent-orders', getRecentOrders)
router.get('/recent-enquiries', getRecentEnquiries)
router.get('/recent-consultations', getRecentConsultations)
router.get('/recent-customers', getRecentCustomers)

export default router
