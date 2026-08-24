import express from 'express'
import { getGallery } from '../controllers/galleryController.js'

const router = express.Router()

// GET /api/v1/gallery — Public gallery list
router.get('/', getGallery)

export default router
