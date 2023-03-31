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
  multerUploadImage.single('image_profile'),
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
  multerUploadImage.array('foto_anggrek', 5),
  body('name').exists().isString().isLength({ min: 3 }),
  body('description').exists().isString().isLength({ min: 10 }),
  body('references').exists().isString().isLength({ min: 10 }),
  handleInputError,
  createAnggrek
)
router.put(
  '/anggrek/:id',
  protect,
  body('name').optional().isString().isLength({ min: 3 }),
  body('description').exists().isString().isLength({ min: 10 }),
  body('references').exists().isString().isLength({ min: 10 }),
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
  body('name').exists().isString().notEmpty().isLength({ min: 3 }),
  body('description').exists().isString().notEmpty().isLength({ min: 10 }),
  handleInputError,
  updateGlosarium
)

router.delete('/glosarium/:id', protect, deleteGlosarium)

export default router
