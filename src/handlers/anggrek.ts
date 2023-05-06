import config from '../config'
import prisma from '../db'
import { isAdmin } from '../modules/auth'
import { serveImage } from '../modules/serve_image'

export const createAnggrek = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // insert anggrek and photo
  try {
    const anggrek = await prisma.anggrek.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        references: req.body.references,
        isApproved: true,
        contributor: {
          create: {
            userId: req.user.id,
          },
        },
      },
    })

    // insert anggrek photo
    if (req.files.length !== 0) {
      const captionPhoto = JSON.parse(req.body?.caption)
      try {
        const imageUpload = await prisma.anggrekPhoto.createMany({
          data: [
            // loop through the files and create a new object for each file
            ...req.files.map((file, index) => ({
              path: '/public/uploads/anggrek/' + file.filename,
              anggrekId: anggrek.id,
              caption: captionPhoto[index],
            })),
          ],
        })
        // console.log('imageUpload', imageUpload)
      } catch (error) {
        console.log(error)
        next(error)
      }
    }

    res.json({
      message: 'Data Anggrek berhasil ditambahkan',
      data: {
        id: anggrek.id,
        name: anggrek.name,
      },
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const updateAnggrek = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const updated = await prisma.anggrek.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: req.body.name,
        description: req.body.description,
        references: req.body.references,
        contributor: {
          create: {
            userId: req.user.id,
          },
        },
      },
    })
    res.json({ message: 'Anggrek berhasil diupdate', data: updated })
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Anggrek'
    next(error)
  }
}

export const getAnggrek = async (req, res, next) => {
  try {
    const anggrek = await prisma.anggrek.findMany({
      where: {
        deletedAt: null,
        isApproved: true,
      },
      include: {
        contributor: {
          distinct: ['userId'],
          select: {
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        photos: {
          select: {
            id: true,
            path: true,
            caption: true,
          },
        },
      },
    })

    // serve path
    const anggrekWithPhoto = anggrek.map((item) => {
      const photos = item.photos.map((photo) => {
        return {
          id: photo.id,
          path: serveImage(config.protocol, config.baseUrl, photo.path),
          caption: photo.caption,
        }
      })
      return {
        ...item,
        photos,
      }
    })

    res.json({ data: anggrekWithPhoto })
  } catch (error) {
    next(error)
  }
}

export const getOneAnggrek = async (req, res, next) => {
  try {
    const id = req.params.id

    const anggrek = await prisma.anggrek.findFirst({
      where: {
        id,
        deletedAt: null,
        isApproved: true,
      },
      include: {
        contributor: {
          select: {
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
        photos: {
          select: {
            id: true,
            path: true,
            caption: true,
          },
        },
      },
    })

    // serve path
    const anggrekWithPhoto = anggrek.photos.map((photo) => {
      return {
        id: photo.id,
        path: serveImage(config.protocol, config.baseUrl, photo.path),
        caption: photo.caption,
      }
    })

    res.json({ data: { ...anggrek, photos: anggrekWithPhoto } })
  } catch (error) {
    next(error)
  }
}

export const deleteAnggrek = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const deleted = await prisma.anggrek.update({
      where: {
        id: req.params.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    res.json({ message: 'Anggrek berhasil dihapus' })
  } catch (error) {
    next(error)
  }
}

export const uploadImageAnggrek = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const anggrekPhoto = await prisma.anggrekPhoto.create({
      data: {
        anggrek: { connect: { id: req.params.id } },
        path: '/public/uploads/anggrek/' + req.file.filename,
      },
    })

    // serve path
    anggrekPhoto.path = serveImage(
      config.protocol,
      config.baseUrl,
      anggrekPhoto.path
    )

    res.json({ message: 'Image berhasil diupload', data: anggrekPhoto })
  } catch (error) {
    next(error)
  }
}

export const deleteImageAnggrek = async (req, res, next) => {
  // check if user is admin
  if (await !isAdmin(req.user)) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const anggrekPhoto = await prisma.anggrekPhoto.delete({
      where: {
        id: req.params.id,
      },
    })

    // delete image from server
    const fs = require('fs')
    const path = __dirname + '/../../' + anggrekPhoto.path
    fs.unlink(`${path}`, (err) => {
      if (err) {
        console.error(err)
        return
      }
    })

    res.json({ message: 'Image berhasil dihapus', data: anggrekPhoto })
  } catch (error) {
    next(error)
  }
}
