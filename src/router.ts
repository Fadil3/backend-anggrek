import { Router } from 'express'
import { body } from 'express-validator'

import {
  uploadImageProfile,
  getUserProfile,
  getUserProfileById,
  editUserProfile,
  changePasswordUser,
} from './handlers/profile'
import {
  getAnggrek,
  getOneAnggrek,
  createAnggrek,
  updateAnggrek,
  uploadImageAnggrek,
  deleteImageAnggrek,
} from './handlers/anggrek'
import {
  getGlosarium,
  getOneGlosarium,
  createGlosarium,
  updateGlosarium,
  deleteGlosarium,
} from './handlers/glosarium'

import { multerUploadImage } from './modules/uploadImage'
import { protect } from './modules/auth'
import { handleInputError } from './modules/middleware'

const router = Router()

/**
 * Profile
 */
router.post(
  '/upload-image-profile',
  protect,
  multerUploadImage.single('avatar'),
  uploadImageProfile
)
router.get('/profile', getUserProfile)
router.get('/profile/:id', getUserProfileById)
router.put(
  '/profile',
  protect,
  body('name').exists().isString(),
  body('email').exists().isEmail(),
  handleInputError,
  editUserProfile
)
router.put(
  '/change-password',
  protect,
  body('old_password').exists().isString(),
  body('new_password').exists().isString(),
  handleInputError,
  changePasswordUser
)

/**
 * Anggrek
 */
router.get('/anggrek', getAnggrek)
router.get('/anggrek/:id', getOneAnggrek)
router.post(
  '/anggrek',
  protect,
  body('name').exists().isString(),
  body('description').exists().isString(),
  body('references').exists().isString(),
  handleInputError,
  createAnggrek
)
router.put(
  '/anggrek/:id',
  protect,
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('references').optional().isString(),
  handleInputError,
  updateAnggrek
)
router.post(
  '/upload-image-anggrek',
  protect,
  multerUploadImage.single('foto-anggrek'),
  uploadImageAnggrek
)
router.delete('/delete-image-anggrek/:id', protect, deleteImageAnggrek)

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
  body('name').exists().isString(),
  body('description').exists().isString(),
  handleInputError,
  updateGlosarium
)

router.delete('/glosarium/:id', protect, deleteGlosarium)

export default router
