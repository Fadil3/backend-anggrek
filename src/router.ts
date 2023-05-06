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
  deleteAnggrek,
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

import {
  getPosts,
  createPost,
  getDetailPost,
  getCommentPost,
  commentPost,
} from './handlers/forum'

import {
  getArticles,
  getDetailArticle,
  createArticle,
  updateArticle,
  publishArticle,
  unpublishArticle,
  deleteArticleAdmin,
  getArticleUser,
  getDetailArticleUser,
  deleteArticleUser,
} from './handlers/article'

import {
  getArticleCategories,
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
} from './handlers/articleCategory'

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
  multerUploadImage('profile').single('image_profile'),
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
  multerUploadImage('anggrek').array('foto_anggrek', 5),
  body('name').exists().isString().isLength({ min: 3 }),
  body('description').exists().isString().isLength({ min: 10 }),
  body('references').exists().isString().isLength({ min: 10 }),
  body('caption').optional(),
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
router.delete('/anggrek/:id', protect, deleteAnggrek)
router.post(
  '/upload-image-anggrek/:id',
  protect,
  multerUploadImage('anggrek').single('foto_anggrek'),
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

/**
 * Forum
 */

router.get('/forum', getPosts)
router.get('/forum/:id/comments', getCommentPost)
router.post(
  '/forum/:id/comments',
  protect,
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  commentPost
)
router.get('/forum/:id', getDetailPost)

router.post(
  '/forum',
  protect,
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  handleInputError,
  createPost
)

/**
 * Article
 *
 */

router.get('/articles', getArticles)
router.get('/articles/:id', getDetailArticle)

router.post(
  '/articles',
  protect,
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  body('description').optional().isString().isLength({ min: 10 }),
  body('category').exists().notEmpty(),
  body('infographic').optional(),
  handleInputError,
  createArticle
)

router.put(
  '/articles/:id',
  protect,
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  body('description').optional().isString().isLength({ min: 10 }),
  body('category').exists().isInt().notEmpty(),
  handleInputError,
  updateArticle
)

router.put('/articles/:id/publish', protect, publishArticle)
router.put('/articles/:id/unpublish', protect, unpublishArticle)

router.delete('/articles/:id', protect, deleteArticleAdmin)

// User Article
router.get('/user/articles', protect, getArticleUser)
router.get('/user/articles/:id', protect, getDetailArticleUser)
router.delete('/user/articles/:id', protect, deleteArticleUser)

/**
 * category
 */
router.get('/article-categories', getArticleCategories)
router.post(
  '/article-categories',
  protect,
  body('name').exists().isString().notEmpty().isLength({ min: 3 }),
  handleInputError,
  createArticleCategory
)
router.put(
  '/article-categories/:id',
  protect,
  body('name').exists().isString().notEmpty().isLength({ min: 3 }),
  handleInputError,
  updateArticleCategory
)
router.delete('/article-categories/:id', protect, deleteArticleCategory)

export default router
