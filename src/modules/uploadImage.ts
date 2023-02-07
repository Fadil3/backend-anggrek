import multer from 'multer'
import { protect } from '../modules/auth'

const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname)
  },
})

export const multerUploadImage = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1,
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Hanya File Gambar yang Diizinkan !'))
  },
})
