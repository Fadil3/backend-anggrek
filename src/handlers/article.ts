import config from '../config'
import prisma from '../db'
import { isAdmin } from '../modules/auth'
import { serveImage } from '../modules/serve_image'
import { createUniqueSlugArticle } from '../modules/slug'

export const getArticles = async (req, res, next) => {
  const published = req.query.published || false
  const page = parseInt(req.query.page) || 1
  const search = req.query.search || ''
  const categorySearch = req.query.category || ''
  const infographic = req.query.infographic || false
  let whereClause = {}
  let infographicClause = {
    infographic: {
      some: {
        path: {
          not: '',
        },
      },
    },
  }
  if (published) {
    whereClause = {
      published: published === 'true' ? true : false,
    }
  }
  if (infographic) {
    // merge where clause
    whereClause = {
      ...whereClause,
      ...infographicClause,
    }
  }
  const count =
    search || categorySearch || published
      ? await prisma.article.count({
          where: {
            categories: {
              some: {
                category: {
                  id: {
                    contains: categorySearch,
                  },
                },
              },
            },
            title: {
              contains: search,
              mode: 'insensitive',
            },
            ...whereClause,
          },
        })
      : await prisma.article.count()
  const per_page = parseInt(req.query.per_page) || 10

  try {
    const article = await prisma.article.findMany({
      where: {
        categories: {
          some: {
            category: {
              id: {
                contains: categorySearch,
              },
            },
          },
        },
        title: {
          contains: search,
          mode: 'insensitive',
        },
        ...whereClause,
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
      skip: (page - 1) * per_page,
      take: per_page,
    })
    res.json({
      message: 'Berhasil mendapatkan artikel',
      data: article.map((item) => {
        // serve image infographic if exist
        if (item.infographic.length > 0) {
          item.infographic[0].path = serveImage(
            config.protocol,
            config.baseUrl,
            item.infographic[0].path
          )
          return {
            ...item,
            infographic: item.infographic[0],
          }
        }
        return item
      }),
      meta: {
        current_page: page,
        per_page: per_page,
        total: count,
        total_page: Math.ceil(count / per_page),
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const getDetailArticle = async (req, res, next) => {
  try {
    const slug = req.params.slug
    const article = await prisma.article.findFirst({
      where: {
        slug,
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

    await prisma.article.update({
      where: {
        id: article.id,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    res.json({
      message: 'Berhasil mendapatkan artikel',
      data: {
        ...article,
        infographic: article.infographic[0],
        similiarArticle: await prisma.article.findMany({
          where: {
            categories: {
              some: {
                category: {
                  id: {
                    in: article.categories.map((cat) => cat.category.id),
                  },
                },
              },
            },
            published: true,
            id: {
              not: article.id,
            },
          },
        }),
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
        slug: await createUniqueSlugArticle(title),
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

    if (req.file) {
      try {
        const imageUpload = await prisma.infographic.create({
          data: {
            path: '/public/uploads/infographic/' + req.file.filename,
            articleId: article.id,
          },
        })
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
  const { slug } = req.params
  const { title, content, category, description } = req.body
  const article = await prisma.article.findFirst({
    where: { slug },
    include: { author: true },
  })

  if (!article) {
    return res.status(404).json({ message: 'Article not found' })
  }

  if (
    article.author.id !== req.user.id &&
    (await isAdmin(req.user)) === false
  ) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  try {
    const newSlug =
      article.title !== title ? await createUniqueSlugArticle(title) : slug
    const updatedArticle = await prisma.article.update({
      where: {
        slug: req.params.slug,
      },
      data: {
        title,
        content,
        description,
        slug: newSlug,
        categories: {
          deleteMany: {
            articleId: article.id,
          },
          createMany: {
            data: JSON.parse(category).map((cat) => ({
              categoryId: cat,
            })),
          },
        },
      },
    })
    res.json({ message: 'Berhasil mengupdate artikel', data: updatedArticle })
  } catch (error) {
    next(error)
  }
}

export const publishArticle = async (req, res, next) => {
  const article = await prisma.article.findFirst({
    where: { id: req.params.id },
    include: { author: true },
  })

  if (
    article.author.id !== req.user.id &&
    (await isAdmin(req.user)) === false
  ) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const article = await prisma.article.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    })

    const approve = await prisma.article.update({
      where: {
        id: req.params.id,
      },
      data: {
        published: true,
      },
    })

    // notify user
    const notification = await prisma.notification.create({
      data: {
        message: 'Artikel anda telah dipublish',
        link: '/artikel/' + article.slug,
        userId: article.author.id,
      },
    })

    res.json({ message: 'Berhasil mempublish artikel', data: approve })
  } catch (error) {
    next(error)
  }
}

export const unpublishArticle = async (req, res, next) => {
  const article = await prisma.article.findFirst({
    where: { id: req.params.id },
    include: { author: true },
  })

  if (
    article.author.id !== req.user.id &&
    (await isAdmin(req.user)) === false
  ) {
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
      },
    })

    if (articleGet.authorId === req.user.id) {
      const article = await prisma.article.delete({
        where: {
          id,
        },
      })
      return res.json({ message: 'Berhasil menghapus artikel', data: article })
    }
    // return res.status(404).json({ message: 'Artikel tidak ditemukan' })
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
    // console.log('req', req.params.id)
    //get infographic id
    const article = await prisma.article.findFirst({
      where: {
        slug: req.params.id,
      },
    })

    // console.log('article', article)

    // get article infographic
    const infographic = await prisma.infographic.findFirst({
      where: {
        articleId: article.id,
      },
    })

    const image = await prisma.infographic.update({
      data: {
        path: '/public/uploads/infographic/' + req.file.filename,
      },
      where: {
        id: infographic.id,
      },
    })

    // serve path
    image.path = serveImage(config.protocol, config.baseUrl, image.path)

    res.json({ message: 'Image berhasil diupload', data: image })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const deleteImageInfographic = async (req, res, next) => {
  try {
    // get image path
    const imagePath = await prisma.infographic.findFirst({
      where: {
        id: req.params.id,
      },
    })

    const image = await prisma.infographic.update({
      where: {
        id: req.params.id,
      },
      data: {
        path: '',
      },
    })

    const fs = require('fs')
    const path = __dirname + '/../../' + imagePath.path
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
