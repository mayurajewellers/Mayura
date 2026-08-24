import express from 'express'
import { getPages, getPageBySlug } from '../controllers/pageController.js'

const router = express.Router()

// GET /api/v1/pages — Public pages list
router.get('/', getPages)

// GET /api/v1/pages/:slug — Public page by slug
router.get('/:slug', getPageBySlug)

export default router
