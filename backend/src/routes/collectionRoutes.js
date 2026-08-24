import express from 'express'
import { getCollections, getCollectionBySlug } from '../controllers/collectionController.js'

const router = express.Router()

/**
 * Public Collection Routes
 */

// GET /api/v1/collections — List active collections
router.get('/', getCollections)

// GET /api/v1/collections/:slug — Get single active collection by slug
router.get('/:slug', getCollectionBySlug)

export default router
