import config from '../config'
import prisma from '../db'
import { isAdmin } from '../modules/auth'
import { serveImage } from '../modules/serve_image'

export const getArticles = async (req, res, next) => {
  const { page, limit, published } = req.query

  let whereClause = {}
  if (published) {
    whereClause = {
      published: published === 'true' ? true : false,
    }
  }
  try {
    const article = await prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    })
    res.json({ message: 'Berhasil mendapatkan artikel', data: article })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const getDetailArticle = async (req, res, next) => {
  try {
    const id = req.params.id
    const article = await prisma.article.findFirst({
      where: {
        id,
        // published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        infographic: true,
      },
    })

    // serve image infographic
    if (article.infographic.length > 0) {
      article.infographic[0].path = serveImage(
        config.protocol,
        config.baseUrl,
        article.infographic[0].path
      )
    }

    res.json({
      message: 'Berhasil mendapatkan artikel',
      data: {
        ...article,
        infographic: article.infographic[0],
      },
    })
  } catch (error) {
    next(error)
  }
}

export const createArticle = async (req, res, next) => {
  try {
    const { title, content, category, description } = req.body

    const article = await prisma.article.create({
      data: {
        title,
        content,
        published: (await isAdmin(req.user)) ? true : false,
        // draft: draft ? true : false,
        description,
        author: {
          connect: {
            id: req.user.id,
          },
        },
        categories: {
          createMany: {
            data: JSON.parse(category).map((cat) => ({
              categoryId: cat,
            })),
          },
        },
      },
    })

    if (req.files) {
      try {
        const imageUpload = await prisma.infographic.create({
          data: {
            path: '/public/uploads/infographic/' + req.file.filename,
            articleId: article.id,
          },
        })
        // console.log('imageUpload', imageUpload)
      } catch (error) {
        console.log(error)
        next(error)
      }
    }

    res.json({
      message: 'Berhasil membuat artikel',
      data: article,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const updateArticle = async (req, res, next) => {
  try {
    const { title, content, category, description } = req.body
    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },
      data: {
        title,
        content,
        description,
        // draft: draft ? true : false,
        categories: {
          deleteMany: {
            articleId: req.params.id,
          },
          createMany: {
            data: JSON.parse(category).map((cat) => ({
              categoryId: cat,
            })),
          },
        },
      },
    })
    res.json({ message: 'Berhasil mengupdate artikel', data: article })
  } catch (error) {
    next(error)
  }
}

export const publishArticle = async (req, res, next) => {
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },
      data: {
        published: true,
      },
    })
    res.json({ message: 'Berhasil mempublish artikel', data: article })
  } catch (error) {
    next(error)
  }
}

export const unpublishArticle = async (req, res, next) => {
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },
      data: {
        published: false,
      },
    })
    res.json({ message: 'Berhasil unpublish artikel', data: article })
  } catch (error) {
    next(error)
  }
}

export const deleteArticleAdmin = async (req, res, next) => {
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const article = await prisma.article.delete({
      where: {
        id: req.params.id,
      },
    })
    res.json({ message: 'Berhasil menghapus artikel', data: article })
  } catch (error) {
    next(error)
  }
}

/**
 * User manage article
 */

export const getArticleUser = async (req, res, next) => {
  try {
    const article = await prisma.article.findMany({
      where: {
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
        categories: true,
      },
    })
    res.json({ message: 'Berhasil mendapatkan artikel', data: article })
  } catch (error) {
    next(error)
  }
}

export const getDetailArticleUser = async (req, res, next) => {
  try {
    const id = req.params.id
    const article = await prisma.article.findFirst({
      where: {
        id,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            id: true,
          },
        },
        categories: {
          select: {
            id,
          },
        },
      },
    })
    res.json({ message: 'Berhasil mendapatkan artikel', data: article })
  } catch (error) {
    next(error)
  }
}

export const deleteArticleUser = async (req, res, next) => {
  try {
    const id = req.params.id
    const articleGet = await prisma.article.findFirst({
      where: {
        id,
        authorId: req.user.id,
      },
    })

    if (!articleGet) {
      return res.status(404).json({ message: 'Artikel tidak ditemukan' })
    }

    const article = await prisma.article.delete({
      where: {
        id: req.params.id,
      },
    })

    res.json({ message: 'Berhasil menghapus artikel', data: article })
  } catch (error) {
    next(error)
  }
}

/**
 * image upload
 */

export const uploadImageArticle = async (req, res, next) => {
  try {
    const image = await prisma.imageUpload.create({
      data: {
        path: '/public/uploads/articles/' + req.file.filename,
      },
    })

    // serve path
    image.path = serveImage(config.protocol, config.baseUrl, image.path)

    res.json({ message: 'Image berhasil diupload', data: image })
  } catch (error) {
    next(error)
  }
}

export const uploadImageInfographic = async (req, res, next) => {
  try {
    const image = await prisma.infographic.create({
      data: {
        path: '/public/uploads/infographic/' + req.file.filename,
        articleId: req.params.id,
      },
    })

    // serve path
    image.path = serveImage(config.protocol, config.baseUrl, image.path)

    res.json({ message: 'Image berhasil diupload', data: image })
  } catch (error) {
    next(error)
  }
}

export const deleteImageInfographic = async (req, res, next) => {
  try {
    const image = await prisma.infographic.delete({
      where: {
        id: req.params.id,
      },
    })

    // delete image from server
    const fs = require('fs')
    const path = __dirname + '/../../' + image.path
    fs.unlink(`${path}`, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })

    res.json({ message: 'Image berhasil dihapus', data: image })
  } catch (error) {
    next(error)
  }
}
