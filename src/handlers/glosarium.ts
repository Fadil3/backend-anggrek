import prisma from '../db'

// Get all
export const getGlosarium = async (req, res) => {
  const glosarium = await prisma.glosarium.findMany({
    include: {
      // get the user who updated the glosarium and fetch their name
      updater: {
        select: {
          name: true,
        },
      },
    },
  })

  res.json({ data: glosarium })
}

// Get one
export const getOneGlosarium = async (req, res) => {
  const id = req.params.id

  const glosarium = await prisma.glosarium.findFirst({
    where: {
      id,
    },
  })

  res.json({ data: glosarium })
}

// Create one
export const createGlosarium = async (req, res) => {
  console.log(req.user.id)
  const glosarium = await prisma.glosarium.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user.id,
    },
  })

  res.json({
    data: {
      message: 'Glosarium created successfully',
      data: glosarium.name,
    },
  })
}

// Update one
export const updateGlosarium = async (req, res) => {
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

  res.json({ data: updated })
}

// Delete one
export const deleteGlosarium = async (req, res, next) => {
  try {
    const deleted = await prisma.glosarium.delete({
      where: {
        id: req.params.id,
      },
    })
    res.json({ data: deleted })
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Glosarium'
    next(error)
  }
}
