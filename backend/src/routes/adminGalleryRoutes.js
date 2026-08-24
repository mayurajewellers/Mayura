import express from 'express'
import {
  getAdminGallery,
  createGalleryItem,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/gallery — List gallery items
router.get('/', getAdminGallery)

// POST /api/v1/admin/gallery — Create gallery item
router.post('/', createGalleryItem)

// GET /api/v1/admin/gallery/:id — Get gallery item by ID or legacyId
router.get('/:id', getGalleryItemById)

// PUT /api/v1/admin/gallery/:id — Update gallery item
router.put('/:id', updateGalleryItem)

// DELETE /api/v1/admin/gallery/:id — Soft delete gallery item
router.delete('/:id', deleteGalleryItem)

export default router
