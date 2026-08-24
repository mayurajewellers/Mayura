import express from 'express'
import {
  getAdminBanners,
  createBanner,
  getBannerById,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

/**
 * Admin Banner Routes
 * All routes require authentication AND ADMIN role.
 */
router.use(authenticate, requireAdmin)

// GET /api/v1/admin/banners — Get all banners (active & inactive)
router.get('/', getAdminBanners)

// POST /api/v1/admin/banners — Create banner
router.post('/', createBanner)

// GET /api/v1/admin/banners/:id — Get banner by ID or slug
router.get('/:id', getBannerById)

// PUT /api/v1/admin/banners/:id — Update banner
router.put('/:id', updateBanner)

// DELETE /api/v1/admin/banners/:id — Soft delete (deactivate) banner
router.delete('/:id', deleteBanner)

export default router
