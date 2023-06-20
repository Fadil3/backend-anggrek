import { Router } from 'express'
import { body } from 'express-validator'

import {
  uploadImageProfile,
  getUserProfile,
  getUserProfileById,
  editUserProfile,
  changePasswordUser,
  getUserContributions,
  getNotification,
  readNotification,
} from './handlers/profile'
import {
  getAnggrek,
  getOneAnggrek,
  createAnggrek,
  updateAnggrek,
  deleteAnggrek,
  uploadImageAnggrek,
  deleteImageAnggrek,
  getProposedAnggrek,
  approveAnggrek,
  approveProposedAnggrek,
  getOneAnggrekById,
} from './handlers/anggrek'
import {
  getGlosarium,
  getOneGlosarium,
  createGlosarium,
  updateGlosarium,
  deleteGlosarium,
  approveGlosarium,
  approveProposedGlosarium,
  proposedGlosarium,
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
  getLatestComment,
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
  uploadImageInfographic,
  deleteImageInfographic,
} from './handlers/article'

import {
  getArticleCategories,
  createArticleCategory,
  updateArticleCategory,
  deleteArticleCategory,
} from './handlers/articleCategory'

import {
  createPostCategory,
  deletePostCategory,
  getPostCategories,
  updatePostCategory,
} from './handlers/postCategory'

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
router.get('/user-contribution/:id', getUserContributions)
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

router.get('/notifications/:id', getNotification)
router.post('/notifications/:id/read', protect, readNotification)

/**
 * Anggrek
 */
router.get('/anggrek', getAnggrek)
router.get('/anggrek/:slug', getOneAnggrek)
router.get('/anggrek_id/:id', getOneAnggrekById)
router.post(
  '/anggrek',
  protect,
  multerUploadImage('anggrek').array('foto_anggrek', 5),
  body('name').exists().isString().isLength({ min: 3 }),
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
  multerUploadImage('anggrek').array('foto_anggrek', 5),
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

router.get('/anggrek_proposed', getProposedAnggrek)
router.post('/anggrek/:id/approve_new', protect, approveAnggrek)
router.post('/anggrek/:id/approve_edit', protect, approveProposedAnggrek)

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

router.get('/glosarium_proposed', proposedGlosarium)
router.post('/glosarium/:id/approve_new', protect, approveGlosarium)
router.post('/glosarium/:id/approve_edit', protect, approveProposedGlosarium)

/**
 * Forum
 */

router.get('/forum', getPosts)
router.get('/forum/:slug', postLimiter, getDetailPost)
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
  body('category').exists().notEmpty(),
  handleInputError,
  createPost
)

router.put(
  '/forum/:slug',
  protect,
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  handleInputError,
  updatePost
)

router.get('/forum/comment/latest', getLatestComment)

router.delete('/forum/:id', protect, deletePost)
router.delete('/comments/:id', protect, deleteComment)

/**
 * Article
 *
 */

router.get('/articles', getArticles)
router.get('/articles/:slug', getDetailArticle)

router.post(
  '/articles',
  protect,
  multerUploadImage('infographic').single('infographic'),
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  body('description').optional().isString().isLength({ min: 10 }),
  body('category').exists().notEmpty(),
  // body('draft').optional().isBoolean(),
  handleInputError,
  createArticle
)

router.post(
  '/upload-image-article',
  protect,
  multerUploadImage('articles').single('image'),
  uploadImageArticle
)

router.post(
  '/upload-image-infographic/:id',
  protect,
  multerUploadImage('infographic').single('infographic'),
  uploadImageInfographic
)

router.delete('/delete-image-infographic/:id', protect, deleteImageInfographic)

router.put(
  '/articles/:slug',
  protect,
  body('title').exists().isString().notEmpty().isLength({ min: 3 }),
  body('content').exists().isString().notEmpty().isLength({ min: 10 }),
  body('description').optional().isString().isLength({ min: 10 }),
  body('category').exists().notEmpty(),
  // body('draft').optional().isBoolean(),
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

router.get('/post-categories', getPostCategories)
router.post(
  '/post-categories',
  protect,
  body('name').exists().isString().notEmpty().isLength({ min: 3 }),
  handleInputError,
  createPostCategory
)
router.put(
  '/post-categories/:id',
  protect,
  body('name').exists().isString().notEmpty().isLength({ min: 3 }),
  handleInputError,
  updatePostCategory
)
router.delete('/post-categories/:id', protect, deletePostCategory)

export default router
