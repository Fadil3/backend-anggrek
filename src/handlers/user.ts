import prisma from '../db'
import {
  createJWT,
  refreshToken,
  hashPassword,
  comparePasswords,
} from '../modules/auth'

import { MailtrapClient } from 'mailtrap'
import config from '../config'

export const createNewUser = async (req, res, next) => {
  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  })

  if (userExists) {
    return res.status(400).json({
      message: 'Email sudah terdaftar',
    })
  }

  try {
    const hash = await hashPassword(req.body.password)

    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        password: hash,
      },
    })

    const access_token = createJWT(user)
    res.json({
      message: 'User berhasil dibuat',
      data: {
        access_token,
      },
    })
  } catch (error) {
    console.log(error)
    error.type = 'input'
    next(error)
  }
}

export const signIn = async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
    },
  })

  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const valid = await comparePasswords(req.body.password, user.password)

  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const access_token = createJWT(user)
  res.json({
    message: 'User berhasil masuk',
    data: {
      access_token,
    },
  })
}

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // update password with random string
    const newPassword = Math.random().toString(36).slice(-8)
    const hash = await hashPassword(newPassword)

    await prisma.user.update({
      where: {
        email: req.body.email,
      },
      data: {
        password: hash,
      },
    })

    // send email
    const client = new MailtrapClient({
      endpoint: config.mailTrapApi,
      token: config.mailTrapToken,
    })

    const sender = {
      email: 'mailtrap@anggrekpedia.my.id',
      name: 'Anggrekpedia',
    }

    const recipient = [
      {
        email: req.body.email,
      },
    ]

    client
      .send({
        from: sender,
        to: recipient,
        subject: 'lupa password',
        text: `password baru anda adalah ${newPassword}`,
        category: 'forgot-password',
      })
      .then(console.log, console.error)
  } catch (error) {
    console.log(error)
    error.type = 'input'
    next(error)
  }
}

export const checkAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
      select: {
        role: true,
      },
    })

    if (user.role === 'MEMBER') {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    return res.json({ message: 'Authorized' })
  } catch (error) {
    console.log(error)
    error.type = 'input'
    next(error)
  }
}
