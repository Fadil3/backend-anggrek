import * as user from '../user'
import app from '../../server'
import request from 'supertest'
describe('POST /user', function () {
  it('create new user', async () => {
    const req = {
      body: {
        username: 'hello',
        password: 'hola',
      },
    }

    const res = {
      // check if the user is created and token is returned
      json({ token }) {
        expect(token).toBeTruthy()
      },
    }

    await user.createNewUser(req, res, () => {})
  })
})
