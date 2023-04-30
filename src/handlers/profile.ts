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
      },
    })

    res.json({ data: user })
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

    res.json({ message: 'Berhasil update profil', data: user })
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
