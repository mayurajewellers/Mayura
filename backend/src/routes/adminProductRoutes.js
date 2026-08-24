import express from 'express'
import {
  createProduct,
  getAdminProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

/**
 * Admin Product Routes
 * All routes require authentication AND ADMIN role.
 */
router.use(authenticate, requireAdmin)

// POST /api/v1/admin/products — Create new product
router.post('/', createProduct)

// GET /api/v1/admin/products — List all products (active & inactive)
router.get('/', getAdminProducts)

// GET /api/v1/admin/products/:id — Get product by MongoDB _id or legacyId
router.get('/:id', getProductById)

// PUT /api/v1/admin/products/:id — Update product by ID
router.put('/:id', updateProduct)

// DELETE /api/v1/admin/products/:id — Soft delete (deactivate) product by ID
router.delete('/:id', deleteProduct)

export default router
