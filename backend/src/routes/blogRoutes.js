import express from 'express'
import { getBlogPosts, getBlogPostBySlug } from '../controllers/blogController.js'

const router = express.Router()

/**
 * Public Blog Routes
 */

// GET /api/v1/blog — Get active published blog posts
router.get('/', getBlogPosts)

// GET /api/v1/blog/:slug — Get single active published blog post by slug
router.get('/:slug', getBlogPostBySlug)

export default router
