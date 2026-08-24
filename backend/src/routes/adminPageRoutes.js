import express from 'express'
import {
  getAdminPages,
  createPage,
  getPageById,
  updatePage,
  deletePage,
} from '../controllers/pageController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

router.use(authenticate, requireAdmin)

// GET /api/v1/admin/pages — List pages
router.get('/', getAdminPages)

// POST /api/v1/admin/pages — Create page
router.post('/', createPage)

// GET /api/v1/admin/pages/:id — Get page by ID or slug
router.get('/:id', getPageById)

// PUT /api/v1/admin/pages/:id — Update page
router.put('/:id', updatePage)

// DELETE /api/v1/admin/pages/:id — Soft delete page
router.delete('/:id', deletePage)

export default router
