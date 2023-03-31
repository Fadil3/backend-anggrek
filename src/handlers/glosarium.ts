import prisma from '../db'
import { isAdmin } from '../modules/auth'

// Get all
export const getGlosarium = async (req, res, next) => {
  try {
    const page = req.query.page || 1
    const count = await prisma.glosarium.count()
    const search = req.query.search || ''
    const glosarium = await prisma.glosarium.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
      // skip: (page - 1) * 10,
      // take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        contributor: {
          select: {
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          distinct: ['userId'],
        },
      },
    })

    const flattenResult = glosarium.map((item) => {
      return {
        ...item,
        contributor: item.contributor.map((item) => {
          return {
            name: item.user.name,
            id: item.user.id,
          }
        }),
      }
    })

    res.json({
      message: 'Berhasil mendapatkan data',
      data: flattenResult,
      meta: {
        current_page: page,
        per_page: 10,
        total: count,
        total_page: Math.ceil(count / 10),
      },
    })
  } catch (error) {
    next(error)
  }
}

// Get one
export const getOneGlosarium = async (req, res, next) => {
  try {
    const id = req.params.id

    const glosarium = await prisma.glosarium.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        contributor: {
          select: {
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          distinct: ['userId'],
        },
      },
    })

    res.json({ message: 'Berhasil mendapatkan data', data: glosarium })
  } catch (error) {
    next(error)
  }
}

// Create one
export const createGlosarium = async (req, res, next) => {
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const glosarium = await prisma.glosarium.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        contributor: {
          create: {
            userId: req.user.id,
          },
        },
      },
    })

    res.json({
      message: 'Glosarium berhasil dibuat',
      data: {
        id: glosarium.id,
        name: glosarium.name,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

// Update one
export const updateGlosarium = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const updated = await prisma.glosarium.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: req.body.name,
        description: req.body.description,
        contributor: {
          create: {
            userId: req.user.id,
          },
        },
      },
    })

    res.json({ message: 'Glosarium berhasil diupdate', data: updated })
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Glosarium'
    next(error)
  }
}

// Delete one
export const deleteGlosarium = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const deleted = await prisma.glosarium.update({
      where: {
        id: req.params.id,
      },
      data: {
        contributor: {
          deleteMany: {},
        },
      },
    })

    const deletedGlosarium = await prisma.glosarium.delete({
      where: {
        id: req.params.id,
      },
    })
    res.json({ message: 'Glosarium berhasil dihapus' })
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Glosarium'
    next(error)
  }
}
