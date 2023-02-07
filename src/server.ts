import express from 'express'
import router from './router'
import morgan from 'morgan'
import { body } from 'express-validator'
import { createNewUser, signIn } from './handlers/user'
import { handleInputError } from './modules/middleware'

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('static'))

const port = process.env.PORT || 9999
const path = require('path')

app.get('/', (req, res) => {
  res.status(200)
  res.json({ message: 'Hello' })
})

app.use('/api', router)
app.post(
  '/user',
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

app.use((err, req, res, next) => {
  const { message } = err
  if (err.type === 'auth') {
    res.status(401)
    res.json({ message: 'Unauthorized' })
  } else if (err.type === 'input') {
    res.status(400)
    res.json({ message: 'Invalid Input' })
  } else if (err.type === 'notFound') {
    res.status(404)
    res.json({ message: `${message} Tidak Ditemukan` })
  } else {
    res.status(500)
    res.json({ message: 'Internal Server Error' })
  }
})

export default app
