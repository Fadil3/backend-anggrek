import prisma from '../db'
import fs from 'fs'
import { comparePasswords, hashPassword } from '../modules/auth'
import { createJWT } from '../modules/auth'

export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
      select: {
        name: true,
        email: true,
        image_profile: true,
      },
    })

    res.json({ data: user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getNotification = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        notifications: {
          select: {
            id: true,
            message: true,
            createdAt: true,
            link: true,
            isRead: true,
            user: {
              select: {
                name: true,
                id: true,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    res.json({ data: user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const readNotification = async (req, res) => {
  try {
    const user = await prisma.notification.update({
      where: {
        id: req.params.id,
      },
      data: {
        isRead: true,
      },
    })

    res.json({ message: 'Berhasil membaca notifikasi', data: user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUserProfileById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        name: true,
        email: true,
        image_profile: true,
        posts: {
          select: {
            id: true,
            title: true,
          },
        },
        articles: {
          select: {
            id: true,
            title: true,
          },
        },
        contributor_anggrek: {
          select: {
            anggrek: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        contributor_glosarium: {
          select: {
            glosarium: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    })

    res.json({ data: user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUserContributions = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        posts: {
          select: {
            id: true,
            slug: true,
            title: true,
            published: true,
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        articles: {
          select: {
            id: true,
            slug: true,
            title: true,
            published: true,
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        contributor_anggrek: {
          select: {
            anggrek: {
              select: {
                id: true,
                slug: true,
                name: true,
                isApproved: true,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        contributor_glosarium: {
          select: {
            glosarium: {
              select: {
                id: true,
                name: true,
                isApproved: true,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    res.json({ message: 'berhasil mendapatkan data', data: user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const editUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: {
        email: req.user.email,
      },
      data: {
        name: req.body.name,
        email: req.body.email,
      },
    })

    // update token
    const access_token = await createJWT(user)

    res.json({
      message: 'Berhasil update profil',
      data: { user, access_token },
    })
    console.log(access_token)

    // res.json({ message: 'Berhasil update profil', data: user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const changePasswordUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
      select: {
        password: true,
      },
    })

    const valid = await comparePasswords(req.body.old_password, user.password)

    if (!valid) {
      return res.status(401).json({ message: 'Password lama tidak sesuai' })
    }

    const hash = await hashPassword(req.body.new_password)

    const userUpdate = await prisma.user.update({
      where: {
        email: req.user.email,
      },
      data: {
        password: hash,
      },
    })

    const access_token = createJWT(userUpdate)

    res.json({
      message: 'Berhasil update password',
      data: { userUpdate, access_token },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const uploadImageProfile = async (req, res) => {
  try {
    const oldImage = await prisma.user.findUnique({
      where: {
        email: req.user.email,
      },
      select: {
        image_profile: true,
      },
    })

    const user = await prisma.user.update({
      where: {
        email: req.user.email,
      },
      data: {
        // serve path
        image_profile: '/public/uploads/profile/' + req.file.filename,
      },
    })

    if (!oldImage.image_profile.includes('default-profile.png')) {
      // convert path to absolute path
      const path = __dirname + '/../../' + oldImage.image_profile
      fs.unlinkSync(path) // delete old image
    }

    const access_token = createJWT(user)

    res.json({
      message: 'Berhasil upload gambar',
      data: { user, access_token },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
