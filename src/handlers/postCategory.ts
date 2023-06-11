import prisma from '../db'
import { isAdmin } from '../modules/auth'

export const getPostCategories = async (req, res, next) => {
  try {
    const postCategories = await prisma.postCategory.findMany()
    res.json({
      message: 'Berhasil mendapatkan kategori',
      data: postCategories,
    })
  } catch (error) {
    next(error)
  }
}

export const createPostCategory = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const postCategory = await prisma.postCategory.create({
      data: {
        name: req.body.name,
      },
    })

    res.json({
      message: 'Berhasil membuat kategori',
      data: postCategory,
    })
  } catch (error) {
    next(error)
  }
}

export const updatePostCategory = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const postCategory = await prisma.postCategory.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: req.body.name,
      },
    })

    res.json({
      message: 'Berhasil mengupdate kategori',
      data: postCategory,
    })
  } catch (error) {
    next(error)
  }
}

export const deletePostCategory = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    await prisma.postCategory.delete({
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
