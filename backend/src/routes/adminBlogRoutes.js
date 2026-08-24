import express from 'express'
import {
  getAdminBlogPosts,
  createBlogPost,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} from '../controllers/blogController.js'
import authenticate from '../middleware/auth.js'
import requireAdmin from '../middleware/admin.js'

const router = express.Router()

/**
 * Admin Blog Routes
 * All routes require authentication AND ADMIN role.
 */
router.use(authenticate, requireAdmin)

// GET /api/v1/admin/blog — Get all blog posts (published, draft, archived, inactive)
router.get('/', getAdminBlogPosts)

// POST /api/v1/admin/blog — Create blog post
router.post('/', createBlogPost)

// GET /api/v1/admin/blog/:id — Get blog post by ID, legacyId, or slug
router.get('/:id', getBlogPostById)

// PUT /api/v1/admin/blog/:id — Update blog post
router.put('/:id', updateBlogPost)

// DELETE /api/v1/admin/blog/:id — Soft delete (deactivate) blog post
router.delete('/:id', deleteBlogPost)

export default router
