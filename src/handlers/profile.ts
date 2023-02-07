import prisma from '../db'
import fs from 'fs'
import { comparePasswords, hashPassword } from '../modules/auth'

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

    res.json({ message: 'Berhasil update password', data: userUpdate })
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
        image_profile: req.file.path,
      },
    })

    if (!oldImage.image_profile.includes('default-profile.png')) {
      // check if user has old image
      fs.unlinkSync(oldImage.image_profile) // delete old image
    }

    res.json({ message: 'Berhasil upload gambar', data: user })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
