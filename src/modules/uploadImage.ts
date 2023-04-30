import multer from 'multer'

const path = require('path')

export const multerUploadImage = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(
        null,
        `${folderName ? `public/uploads/${folderName}` : 'public/uploads'}`
      )
    },

    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname)
    },
  })

  return multer({
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
}
