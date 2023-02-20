import app from '../../server'
import request from 'supertest'

const loginAdmin = async () => {
  const login = await request(app)
    .post('/signin')
    .send({ email: 'fadilAdmin@gmail.com', password: 'fadil123' })

  return login.body.data.access_token
}

const loginBiasa = async () => {
  const login = await request(app)
    .post('/signin')
    .send({ email: 'fadil@gmail.com', password: 'fadil123' })

  return login.body.data.access_token
}

describe('CREATE Glosarium /glosarium', function () {
  it('Create new glosarium | unauthorized (not login)', async () => {
    const res = await request(app).post('/api/glosarium').send({
      name: 'Glosarium 1',
      description: 'Glosarium 1',
    })
    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message', 'Unauthorized')
  })

  it('Create new glosarium | unauthorized (member biasa)', async () => {
    // Get token from response login
    const token = await loginBiasa()
    const res = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium 1',
        description: 'Glosarium 1',
      })
    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message', 'Unauthorized')
  })

  it('Create new glosarium but invalid input', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const res = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium 1',
      })
    expect(res.statusCode).toEqual(400)
    expect(res.body).toHaveProperty('errors[0].msg', 'Invalid value')
  })

  it('Create new glosarium', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const res = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium test',
        description: 'Glosarium test',
      })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message', 'Glosarium berhasil dibuat')
    expect(res.body).toHaveProperty('data.name', 'Glosarium test')
  })
})

describe('PUT Glosarium /glosarium', function () {
  it('Update glosarium | unauthorized (not login)', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const res = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium test untuk di-update',
        description: 'Glosarium test untuk di-update',
      })

    const resUpdate = await request(app)
      .put('/api/glosarium/' + res.body.data.id)
      .send({
        name: 'Glosarium test sudah di-update',
        description: 'Glosarium test sudah di-update',
      })
    expect(resUpdate.statusCode).toEqual(401)
    expect(resUpdate.body).toHaveProperty('message', 'Unauthorized')
  })

  it('Update glosarium | unauthorized (member)', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const tokenBiasa = await loginBiasa()

    const res = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium test untuk di-update',
        description: 'Glosarium test untuk di-update',
      })

    const resUpdate = await request(app)
      .put('/api/glosarium/' + res.body.data.id)
      .auth(tokenBiasa, { type: 'bearer' })
      .send({
        name: 'Glosarium test sudah di-update',
        description: 'Glosarium test sudah di-update',
      })
    expect(resUpdate.statusCode).toEqual(401)
    expect(resUpdate.body).toHaveProperty('message', 'Unauthorized')
  })

  it('Update glosarium | invalid input', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const res = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium test untuk di-update',
        description: 'Glosarium test untuk di-update',
      })

    const resUpdate = await request(app)
      .put('/api/glosarium/' + res.body.data.id)
      .auth(token, { type: 'bearer' })
      .send({
        // name: 'Glosarium test sudah di-update',
        description: 'Glosarium test sudah di-update',
      })
    expect(resUpdate.statusCode).toEqual(400)
    expect(resUpdate.body).toHaveProperty('errors[0].msg', 'Invalid value')
  })

  it('Update glosarium', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const res = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium test untuk di-update',
        description: 'Glosarium test untuk di-update',
      })

    const resUpdate = await request(app)
      .put('/api/glosarium/' + res.body.data.id)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium test sudah di-update',
        description: 'Glosarium test sudah di-update',
      })
    expect(resUpdate.statusCode).toEqual(200)
    expect(resUpdate.body).toHaveProperty(
      'message',
      'Glosarium berhasil diupdate'
    )
    expect(resUpdate.body).toHaveProperty(
      'data.name',
      'Glosarium test sudah di-update'
    )
  })
})

describe('GET Glosarium /glosarium', function () {
  it('Get all glosarium', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const res = await request(app)
      .get('/api/glosarium')
      .auth(token, { type: 'bearer' })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message', 'Berhasil mendapatkan data')
  })

  it('get glosarium by id', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const createGlosarium = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium 1',
        description: 'Glosarium 1',
      })

    const res = await request(app).get(
      '/api/glosarium/' + createGlosarium.body.data.id
    )
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message', 'Berhasil mendapatkan data')
  })
})

describe('DELETE Glosarium /glosarium', function () {
  // create glosarium
  it('Delete glosarium | unauthorized (not login)', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const createGlosarium = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium 1',
        description: 'Glosarium 1',
      })

    const res = await request(app).delete(
      '/api/glosarium/' + createGlosarium.body.data.id
    )
    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message', 'Unauthorized')
  })

  it('Delete glosarium | unauthorized (member)', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const tokenBiasa = await loginBiasa()

    const createGlosarium = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium 1',
        description: 'Glosarium 1',
      })

    const res = await request(app)
      .delete('/api/glosarium/' + createGlosarium.body.data.id)
      .auth(tokenBiasa, { type: 'bearer' })
    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message', 'Unauthorized')
  })

  it('Delete glosarium', async () => {
    // Get token from response login
    const token = await loginAdmin()

    const createGlosarium = await request(app)
      .post('/api/glosarium')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Glosarium 1',
        description: 'Glosarium 1',
      })

    const res = await request(app)
      .delete('/api/glosarium/' + createGlosarium.body.data.id)
      .auth(token, { type: 'bearer' })
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message', 'Glosarium berhasil dihapus')
  })
})
