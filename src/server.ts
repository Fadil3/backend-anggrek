import express from 'express'
import router from './router'
import morgan from 'morgan'

import { body } from 'express-validator'
import { createNewUser, signIn, checkAdmin } from './handlers/user'
import { handleInputError } from './modules/middleware'
import { protect } from './modules/auth'

const app = express()
const cors = require('cors')

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const port = process.env.PORT || 9999
const path = require('path')

app.get('/', (req, res) => {
  res.status(200)
  res.json({ message: 'Hello' })
})

app.use('/api', router)
app.post(
  '/signup',
  body('email').exists().isEmail(),
  body('name').exists().isString(),
  body('password').exists().isString(),
  handleInputError,
  createNewUser
)
app.post(
  '/signin',
  body('email').exists().isEmail(),
  body('password').exists().isString(),
  handleInputError,
  signIn
)
app.get('/checkAdmin', protect, checkAdmin)

app.use((err, req, res, next) => {
  const { message } = err
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.send({
      result: 'fail',
      error: { code: 1001, message: 'File is too big' },
    })
    return
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.send({
      result: 'fail',
      error: { code: 1002, message: 'Unexpected field' },
    })
  } else if (err.type === 'auth') {
    res.status(401)
    res.json({ message: 'Unauthorized' })
  } else if (err.type === 'input') {
    res.status(400)
    res.json({ message: 'Invalid Input' })
  } else if (err.type === 'notFound') {
    res.status(404)
    res.json({ message: `${message} Tidak Ditemukan` })
  } else if (message) {
    res.status(400)
    res.json({ message })
  } else {
    res.status(500)
    res.json({ message: 'Internal Server Error' })
  }
})

export default app
