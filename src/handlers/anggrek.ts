import config from '../config'
import prisma from '../db'
import { isAdmin } from '../modules/auth'
import { serveImage } from '../modules/serve_image'
import { createUniqueSlugAnggrek } from '../modules/slug'

export const createAnggrek = async (req, res, next) => {
  // check if user is admin
  // if ((await isAdmin(req.user)) === false) {
  //   return res.status(401).json({ message: 'Unauthorized' })
  // }

  // destructuring req.body
  const {
    name,
    description,
    references,
    localName,
    degree,
    light,
    humidity,
    genus,
  } = req.body

  // insert anggrek and photo
  try {
    const anggrek = await prisma.anggrek.create({
      data: {
        name,
        slug: await createUniqueSlugAnggrek(name),
        genus,
        description,
        localName: localName || '',
        degree,
        light,
        humidity,
        references,
        isApproved: (await isAdmin(req.user)) === false ? false : true,
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
      const linkPhoto = JSON.parse(req.body?.link)
      console.log('linkPhoto', linkPhoto)
      try {
        const imageUpload = await prisma.anggrekPhoto.createMany({
          data: [
            // loop through the files and create a new object for each file
            ...req.files.map((file, index) => ({
              path: '/public/uploads/anggrek/' + file.filename,
              anggrekId: anggrek.id,
              caption: captionPhoto[index],
              link: linkPhoto[index],
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

// if user create new anggrek
export const approveAnggrek = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const anggrek = await prisma.anggrek.findFirst({
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

    const approve = await prisma.anggrek.update({
      where: {
        id: req.params.id,
      },
      data: {
        isApproved: true,
      },
    })

    // notify user
    const notification = await prisma.notification.create({
      data: {
        message: `Pengajuan Anggrek ${anggrek.name} telah diterima.`,
        link: `/anggrek/${approve.slug}`,
        userId: anggrek.contributor[0].userId,
      },
    })

    res.json({ message: 'Anggrek berhasil diapprove', data: approve })
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Anggrek'
    next(error)
  }
}

// get proposed anggrek (not approved yet)
export const getProposedAnggrek = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const search = req.query.search || ''
    const count = search
      ? await prisma.anggrek.count({
          where: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
            isApproved: false,
            deletedAt: null,
          },
        })
      : await prisma.anggrek.count({
          where: {
            isApproved: false,
            deletedAt: null,
          },
        })
    const per_page = parseInt(req.query.per_page) || 5
    const anggrek = await prisma.anggrek.findMany({
      where: {
        deletedAt: null,
        name: {
          contains: search,
          mode: 'insensitive',
        },
        isApproved: false,
      },
      skip: (page - 1) * per_page,
      take: per_page,
      include: {
        photos: {
          select: {
            id: true,
            path: true,
            caption: true,
            link: true,
          },
          orderBy: {
            path: 'asc',
          },
        },
        contributor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
          distinct: ['userId'],
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
          link: photo.link,
        }
      })
      return {
        ...item,
        photos,
      }
    })

    res.json({
      data: anggrekWithPhoto,
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

// approve proposed (edit) anggrek (not approved yet) to be approved

export const approveProposedAnggrek = async (req, res, next) => {
  // check if user is admin
  if ((await isAdmin(req.user)) === false) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const proposed = await prisma.anggrek.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        photos: true,
        contributor: true,
      },
    })

    const updated = await prisma.anggrek.update({
      where: {
        id: proposed.proposeTo,
      },
      data: {
        name: proposed.name,
        slug: await createUniqueSlugAnggrek(proposed.name),
        genus: proposed.genus,
        description: proposed.description,
        localName: proposed.localName || '',
        degree: proposed.degree,
        light: proposed.light,
        humidity: proposed.humidity,
        references: proposed.references,
        isApproved: true,
        contributor: {
          create: {
            userId: proposed.contributor[0].userId,
          },
        },
      },
    })

    // get image anggrek
    const anggrekPhoto = proposed.photos.map((photo) => {
      return {
        path: photo.path,
        caption: photo.caption,
        link: photo.link,
      }
    })

    // insert anggrek photo
    if (anggrekPhoto.length !== 0) {
      try {
        const imageUpload = await prisma.anggrekPhoto.createMany({
          data: [
            // loop through the files and create a new object for each file
            ...anggrekPhoto.map((file) => ({
              path: file.path,
              anggrekId: updated.id,
              caption: file.caption,
              link: file.link,
            })),
          ],
        })
      } catch (error) {
        console.log(error)
        next(error)
      }
    }

    // notify user
    const notification = await prisma.notification.create({
      data: {
        message: `Pengajuan perubahan data Anggrek ${proposed.name} telah diterima.`,
        link: `/anggrek/${updated.slug}`,
        userId: proposed.contributor[0].userId,
      },
    })

    // delete proposed anggrek
    const deleted = await prisma.anggrek.update({
      where: {
        id: proposed.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    res.json({ message: 'Anggrek berhasil diapprove', data: updated })
  } catch (error) {
    error.type = 'notFound'
    error.message = 'Anggrek'
    next(error)
  }
}

export const updateAnggrek = async (req, res, next) => {
  // check if user is admin
  // if ((await isAdmin(req.user)) === false) {
  //   return res.status(401).json({ message: 'Unauthorized' })
  // }

  // destructuring req.body
  const {
    name,
    description,
    references,
    localName,
    degree,
    light,
    humidity,
    genus,
  } = req.body

  try {
    if (await isAdmin(req.user)) {
      const updated = await prisma.anggrek.update({
        where: {
          id: req.params.id,
        },
        data: {
          name,
          slug: await createUniqueSlugAnggrek(req.body.name),
          genus,
          description,
          localName: localName || '',
          degree,
          light,
          humidity,
          references,
          contributor: {
            create: {
              userId: req.user.id,
            },
          },
        },
      })
      res.json({ message: 'Anggrek berhasil diupdate', data: updated })
    } else {
      console.log('user not admin')
      // user propose to update anggrek
      const proposed = await prisma.anggrek.create({
        data: {
          name,
          slug: await createUniqueSlugAnggrek(req.body.name),
          genus,
          description,
          localName: localName || '',
          degree,
          light,
          humidity,
          references,
          isApproved: false,
          proposeTo: req.params.id,
          contributor: {
            create: {
              userId: req.user.id,
            },
          },
        },
      })

      console.log('proposed', proposed)

      // insert anggrek photo
      if (req?.files) {
        console.log('req.files', req.files)
        const captionPhoto = JSON.parse(req.body?.caption)
        const linkPhoto = JSON.parse(req.body?.link)
        console.log('linkPhoto', linkPhoto)
        try {
          const imageUpload = await prisma.anggrekPhoto.createMany({
            data: [
              // loop through the files and create a new object for each file
              ...req.files.map((file, index) => ({
                path: '/public/uploads/anggrek/' + file.filename,
                anggrekId: proposed.id,
                caption: captionPhoto[index],
                link: linkPhoto[index],
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
        message: 'Berhasil mengajukan perubahan data',
        data: proposed,
      })
    }
  } catch (error) {
    console.log(error)
    error.type = 'notFound'
    error.message = 'Anggrek'
    next(error)
  }
}

export const getAnggrek = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const search = req.query.search || ''
    const count = search
      ? await prisma.anggrek.count({
          where: {
            deletedAt: null,
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        })
      : await prisma.anggrek.count({
          where: {
            deletedAt: null,
            isApproved: true,
          },
        })
    const per_page = parseInt(req.query.per_page) || 5
    const anggrek = await prisma.anggrek.findMany({
      where: {
        deletedAt: null,
        isApproved: true,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      skip: (page - 1) * per_page,
      take: per_page,
      include: {
        photos: {
          select: {
            id: true,
            path: true,
            caption: true,
            link: true,
          },
          orderBy: {
            path: 'asc',
          },
        },
        contributor: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
          distinct: ['userId'],
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
          link: photo.link,
        }
      })
      return {
        ...item,
        photos,
      }
    })

    res.json({
      data: anggrekWithPhoto,
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

export const getOneAnggrek = async (req, res, next) => {
  try {
    const slug = req.params.slug

    const anggrek = await prisma.anggrek.findFirst({
      where: {
        slug,
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
            link: true,
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
        link: photo.link,
      }
    })

    res.json({ data: { ...anggrek, photos: anggrekWithPhoto } })
  } catch (error) {
    next(error)
  }
}

export const getOneAnggrekById = async (req, res, next) => {
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
            link: true,
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
        link: photo.link,
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
  // if ((await isAdmin(req.user)) === false) {
  //   return res.status(401).json({ message: 'Unauthorized' })
  // }

  try {
    const anggrekPhoto = await prisma.anggrekPhoto.create({
      data: {
        caption: req.body.caption,
        link: req.body.link,
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
