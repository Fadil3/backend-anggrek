import prisma from '../db'
import { isAdmin } from '../modules/auth'

export const getArticles = async (req, res, next) => {
  try {
    const article = await prisma.article.findMany({
      where: {
        published: true,
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
      },
    })
    res.json({ message: 'Berhasil mendapatkan artikel', data: article })
  } catch (error) {
    next(error)
  }
}

export const getDetailArticle = async (req, res, next) => {
  try {
    const id = req.params.id
    const article = await prisma.article.findFirst({
      where: {
        id,
        published: true,
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
      },
    })
    res.json({ message: 'Berhasil mendapatkan artikel', data: article })
  } catch (error) {
    next(error)
  }
}

export const createArticle = async (req, res, next) => {
  try {
    const { title, content, category, infographic, description } = req.body

    const article = await prisma.article.create({
      data: {
        title,
        content,
        infographic,
        published: (await isAdmin(req.user)) ? true : false,
        description,
        author: {
          connect: {
            id: req.user.id,
          },
        },
        categories: {
          createMany: {
            data: category.map((cat) => ({
              categoryId: cat,
            })),
          },
        },
      },
    })
    res.json({ message: 'Berhasil membuat artikel', data: article })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const updateArticle = async (req, res, next) => {
  try {
    const { title, content, category, infographic, description } = req.body
    const article = await prisma.article.update({
      where: {
        id: req.params.id,
      },
      data: {
        title,
        content,
        infographic,
        description,
        categories: {
          create: {
            categoryId: category,
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
        // category: {
        //   select: {
        //     name: true,
        //     id: true,
        //   },
        // },
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
