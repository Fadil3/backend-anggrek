import app from '../server'
import request from 'supertest'

describe('GET /', function () {
  it('responds with json', async () => {
    const res = await request(app).get('/')

    expect(res.body.message).toEqual('Hello')
    expect(res.status).toEqual(200)
  })
})
