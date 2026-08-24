import express from 'express'
import { getProducts, getProductBySlug } from '../controllers/productController.js'

const router = express.Router()

/**
 * Public Product Routes
 */

// GET /api/v1/products — Paginated, filtered active product list
router.get('/', getProducts)

// GET /api/v1/products/:slug — Single active product lookup by slug
router.get('/:slug', getProductBySlug)

export default router
