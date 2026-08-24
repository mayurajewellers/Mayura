import express from 'express'
import { getPolicies, getPolicyBySlug } from '../controllers/policyController.js'

const router = express.Router()

// GET /api/v1/policies — List active policies
router.get('/', getPolicies)

// GET /api/v1/policies/:slug — Get single active policy by slug
router.get('/:slug', getPolicyBySlug)

export default router
