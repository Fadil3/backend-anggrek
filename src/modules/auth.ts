import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../db'
const url = require('url')

export const comparePasswords = (password, hash) => {
  return bcrypt.compare(password, hash)
}

export const hashPassword = (password) => {
  return bcrypt.hash(password, 5)
}

export const createJWT = (user) => {
  // path to url
  const image_profile = url.format({
    protocol: 'http',
    host: 'localhost:9999',
    pathname: `${user.image_profile.replace('public', '')}`,
  })

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      image_profile,
    },
    process.env.JWT_SECRET
  )
  return token
}

export const refreshToken = (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    { expiresIn: '1m' },
    process.env.JWT_SECRET_REFRESH
  )
  return token
}

export const isAdmin = async (user) => {
  // Check if user is admin
  const check = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      role: true,
    },
  })

  if (check.role === 'ADMINISTRATOR' || check.role === 'SUPER_ADMINISTRATOR') {
    return true
  }
  return false
}

export const protect = (req, res, next) => {
  const bearer = req.headers.authorization

  // Check if bearer is undefined in the header
  if (!bearer) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // split the bearer and get the token
  const [, token] = bearer.split(' ')
  if (!token) {
    return res.status(401).json({ message: 'Not valid token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded
    next()
    return
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
