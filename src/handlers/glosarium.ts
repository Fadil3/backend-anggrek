import prisma from '../db'
import { isAdmin } from '../modules/auth'

// Get all
export const getGlosarium = async (req, res, next) => {
  try {
    const glosarium = await prisma.glosarium.findMany({
      include: {
        // get the user who updated & created the glosarium and fetch their name
        creator: {
          select: {
            name: true,
          },
        },
        updater: {
          select: {
            name: true,
          },
        },
      },
    })

    res.json({ data: glosarium })
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
    })

    res.json({ data: glosarium })
  } catch (error) {
    next(error)
  }
}

// Create one
export const createGlosarium = async (req, res, next) => {
  // check if user is admin
  if (!isAdmin(req.user)) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const glosarium = await prisma.glosarium.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        createdBy: req.user.id,
      },
    })

    res.json({
      data: {
        message: 'Glosarium berhasil dibuat',
        data: glosarium.name,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Update one
export const updateGlosarium = async (req, res, next) => {
  // check if user is admin
  if (!isAdmin(req.user)) {
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
        updater: { connect: { id: req.user.id } },
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
  if (!isAdmin(req.user)) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const deleted = await prisma.glosarium.delete({
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
