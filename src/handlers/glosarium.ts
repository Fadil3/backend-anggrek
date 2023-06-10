import prisma from '../db'
import { isAdmin } from '../modules/auth'

// Get all
export const getGlosarium = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const search = req.query.search || ''
    const count = search
      ? await prisma.glosarium.count({
          where: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
            isApproved: true,
          },
        })
      : await prisma.glosarium.count({
          where: {
            isApproved: true,
          },
        })
    const per_page = parseInt(req.query.per_page) || 5
    const glosarium = await prisma.glosarium.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
        isApproved: true,
      },
      orderBy: {
        name: 'asc',
      },
      skip: (page - 1) * per_page,
      take: per_page,
      select: {
        id: true,
        isApproved: true,
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
        per_page: per_page,
        total: count,
        total_page: Math.ceil(count / per_page),
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
  try {
    const glosarium = await prisma.glosarium.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        isApproved: (await isAdmin(req.user)) === false ? false : true,
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

// if user create new glosarium
export const approveGlosarium = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const approve = await prisma.glosarium.update({
      where: {
        id: req.params.id,
      },
      data: {
        isApproved: true,
      },
    })

    res.json({ message: 'Glosarium berhasil diapprove' })
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Glosarium'
    next(error)
  }
}

export const proposedGlosarium = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const search = req.query.search || ''
    const count = search
      ? await prisma.glosarium.count({
          where: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
            isApproved: false,
          },
        })
      : await prisma.glosarium.count({
          where: {
            isApproved: false,
          },
        })
    const per_page = parseInt(req.query.per_page) || 5
    const glosarium = await prisma.glosarium.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
        isApproved: false,
      },
      orderBy: {
        name: 'asc',
      },
      skip: (page - 1) * per_page,
      take: per_page,
      select: {
        id: true,
        isApproved: true,
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
        per_page: per_page,
        total: count,
        total_page: Math.ceil(count / per_page),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const approveProposedGlosarium = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    // get proposed glosarium
    const proposed = await prisma.glosarium.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        contributor: {
          select: {
            userId: true,
          },
        },
      },
    })
    console.log('proposed', proposed)

    // update glosarium
    const updated = await prisma.glosarium.update({
      where: {
        id: proposed.proposeTo,
      },
      data: {
        name: proposed.name,
        description: proposed.description,
        contributor: {
          create: {
            userId: proposed.contributor[0].userId,
          },
        },
      },
    })

    console.log('updated', updated)

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
    res.json({
      message: 'Glosarium berhasil diapprove',
      data: {
        id: updated.id,
      },
    })
    // delete proposed glosarium
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Glosarium'
    next(error)
  }
}

// Update one
export const updateGlosarium = async (req, res, next) => {
  // check if user is admin
  // if ((await isAdmin(req.user)) === false) {
  //   return res.status(401).json({ message: 'Unauthorized' })
  // }

  try {
    // check if user is admin
    if (await isAdmin(req.user)) {
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
    } else {
      // user propose update glosarium

      const glosarium = await prisma.glosarium.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          isApproved: false,
          proposeTo: req.params.id,
          contributor: {
            create: {
              userId: req.user.id,
            },
          },
        },
      })

      res.json({
        message: 'Glosarium berhasil diupdate',
        data: glosarium,
      })
    }
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
