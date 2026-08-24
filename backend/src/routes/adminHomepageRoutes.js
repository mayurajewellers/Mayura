import express from 'express'
import {
  getAdminHomepage,
  createHomepageSection,
  getHomepageSectionById,
  updateHomepageSection,
  deleteHomepageSection,
  reorderHomepageSections,
} from '../controllers/homepageController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

/**
 * Admin Homepage Routes
 * All routes require authentication AND ADMIN role.
 */
router.use(authenticate, requireAdmin)

// GET /api/v1/admin/homepage — Get all homepage sections (active & inactive)
router.get('/', getAdminHomepage)

// POST /api/v1/admin/homepage/sections — Create section
router.post('/sections', createHomepageSection)

// GET /api/v1/admin/homepage/sections/:id — Get section by ID or key
router.get('/sections/:id', getHomepageSectionById)

// PUT /api/v1/admin/homepage/sections/:id — Update section by ID
router.put('/sections/:id', updateHomepageSection)

// DELETE /api/v1/admin/homepage/sections/:id — Soft delete (deactivate) section by ID
router.delete('/sections/:id', deleteHomepageSection)

// PUT /api/v1/admin/homepage/reorder — Bulk reorder sections
router.put('/reorder', reorderHomepageSections)

export default router
