import express from 'express'
import { getBanners, getBannerBySlug } from '../controllers/bannerController.js'

const router = express.Router()

/**
 * Public Banner Routes
 */

// GET /api/v1/banners — Get active & currently scheduled banners
router.get('/', getBanners)

// GET /api/v1/banners/:slug — Get single active banner by slug
router.get('/:slug', getBannerBySlug)

export default router
