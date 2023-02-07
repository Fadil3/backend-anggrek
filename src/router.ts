import { Router } from 'express'
import { body } from 'express-validator'

import {
  getGlosarium,
  getOneGlosarium,
  createGlosarium,
  updateGlosarium,
  deleteGlosarium,
} from './handlers/glosarium'

import { protect } from './modules/auth'
import { handleInputError } from './modules/middleware'

const router = Router()

/**
 * Glosarium
 */
router.get('/glosarium', getGlosarium)
router.get('/glosarium/:id', getOneGlosarium)
router.post(
  '/glosarium',
  protect,
  body('name').exists().isString(),
  body('description').exists().isString(),
  handleInputError,
  createGlosarium
)
router.put(
  '/glosarium/:id',
  protect,
  body('name').optional().isString(),
  body('description').optional().isString(),
  handleInputError,
  updateGlosarium
)
router.delete('/glosarium/:id', protect, deleteGlosarium)

export default router
