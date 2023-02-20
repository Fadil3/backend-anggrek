import app from '../../server'
import request from 'supertest'

describe('LOGIN /signin', function () {
  it('Login with invalid email', async () => {
    const res = await request(app).post('/signin').send({
      email: 'aa@gmail.com',
      password: 'fadil123',
    })

    expect(res.statusCode).toEqual(404)
    expect(res.body).toHaveProperty('message', 'User not found')
  })

  it('Login with invalid password', async () => {
    const res = await request(app).post('/signin').send({
      email: 'fadilAdmin@gmail.com',
      password: 'fadilAdmin',
    })

    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message', 'Invalid credentials')
  })

  it('Login with valid input', async () => {
    const res = await request(app).post('/signin').send({
      email: 'fadilAdmin@gmail.com',
      password: 'fadil123',
    })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data.access_token')
  })
})

describe('CREATE USER /signup', function () {
  it('Create new user but invalid input', async () => {
    const res = await request(app).post('/signup').send({
      email: '',
      name: '',
      password: '',
    })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('errors[0].msg', 'Invalid value')
  })

  it('Create new user | email already exist', async () => {
    const res = await request(app).post('/signup').send({
      email: 'fadilAdmin@gmail.com',
      name: 'fadilAdmin',
      password: 'fadil123',
    })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('message', 'Email sudah terdaftar')
  })

  it('Create new user', async () => {
    const res = await request(app).post('/signup').send({
      email: 'mrf1@gmail.com',
      name: 'mrf1',
      password: 'fadil123',
    })
    // console.log(res)
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('data.access_token')
  })
})
