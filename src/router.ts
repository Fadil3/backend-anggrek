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
  deletePost,
  deleteComment,
  updatePost,
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
  uploadImageArticle,
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
import rateLimit from 'express-rate-limit'

const router = Router()
const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

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
  body('localName').optional().isString().isLength({ min: 3 }),
  body('description').exists().isString().isLength({ min: 10 }),
  body('references').exists().isString().isLength({ min: 10 }),
  body('degree').exists().isString().isLength({ min: 3 }),
  body('light').exists().isString().isLength({ min: 3 }),
  body('humidity').exists().isString().isLength({ min: 3 }),

  body('caption').optional(),
  body('link').optional(),
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
router.get('/forum/:id', postLimiter, getDetailPost)
router.get('/forum/:id/comments', getCommentPost)

router.post(
  '/forum/:id/comments',
  protect,
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  commentPost
)
router.post(
  '/forum',
  protect,
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  handleInputError,
  createPost
)

router.put(
  '/forum/:id',
  protect,
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  handleInputError,
  updatePost
)

router.delete('/forum/:id', protect, deletePost)
router.delete('/comments/:id', protect, deleteComment)

/**
 * Article
 *
 */

router.get('/articles', getArticles)
router.get('/articles/:id', getDetailArticle)

router.post(
  '/articles',
  protect,
  multerUploadImage('infographic').single('infographic'),
  // multerUploadImage('articles').array('images', 5),
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  body('description').optional().isString().isLength({ min: 10 }),
  body('category').exists().notEmpty(),
  // body('infographic').optional(),
  handleInputError,
  createArticle
)

router.post(
  '/upload-image-article',
  protect,
  multerUploadImage('articles').single('image'),
  uploadImageArticle
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
