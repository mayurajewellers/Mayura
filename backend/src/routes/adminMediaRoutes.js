import express from 'express'
import multer from 'multer'
import {
  getAdminMedia,
  createMedia,
  uploadMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
} from '../controllers/mediaController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
})

/**
 * Admin Media Routes
 * All routes require authentication AND ADMIN role.
 */
router.use(authenticate, requireAdmin)

// GET /api/v1/admin/media — Get all media records
router.get('/', getAdminMedia)

// POST /api/v1/admin/media/upload — Device multipart file upload to Cloudinary + MongoDB
router.post('/upload', upload.single('file'), uploadMedia)

// POST /api/v1/admin/media — Create media record manually
router.post('/', createMedia)

// GET /api/v1/admin/media/:id — Get media record by ID or publicId
router.get('/:id', getMediaById)

// PUT /api/v1/admin/media/:id — Update media record
router.put('/:id', updateMedia)

// DELETE /api/v1/admin/media/:id — Soft delete (deactivate) media record
router.delete('/:id', deleteMedia)

export default router
