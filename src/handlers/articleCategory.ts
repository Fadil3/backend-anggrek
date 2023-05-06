import prisma from '../db'
import { isAdmin } from '../modules/auth'

export const getArticleCategories = async (req, res, next) => {
  try {
    const articleCategories = await prisma.articleCategory.findMany()
    res.json({
      message: 'Berhasil mendapatkan kategori',
      data: articleCategories,
    })
  } catch (error) {
    next(error)
  }
}

export const createArticleCategory = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const articleCategory = await prisma.articleCategory.create({
      data: {
        name: req.body.name,
      },
    })

    res.json({
      message: 'Berhasil membuat kategori',
      data: articleCategory,
    })
  } catch (error) {
    next(error)
  }
}

export const updateArticleCategory = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const articleCategory = await prisma.articleCategory.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: req.body.name,
      },
    })

    res.json({
      message: 'Berhasil mengupdate kategori',
      data: articleCategory,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteArticleCategory = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    await prisma.articleCategory.delete({
      where: {
        id: req.params.id,
      },
    })

    res.json({
      message: 'Berhasil menghapus kategori',
    })
  } catch (error) {
    next(error)
  }
}
