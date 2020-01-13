import { expect } from 'chai'
import { token, userToken, getData } from '../main.test'
import * as jwt from 'jsonwebtoken'
import UserController from '../../src/controllers/UserController'

const userSecuredRoutes = (): void => {
  it('CHECKS that token is correct', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = `token=${token}`
    getData(`http://localhost:7331/checktoken`, { method: 'POST', headers: headers, body: data})
    .then(result => {
      expect(result.valid).equals(true)
      done()
    })
  })

  it('FAILS to check that fake token is correct', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = `token=${token}e`
    getData(`http://localhost:7331/checktoken`, { method: 'POST', headers: headers, body: data})
    .then(result => {
      expect(result.valid).equals(false)
      done()
    })
  })

  it('CHECKS user password successfully', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    const data = `password=doe`

    getData("http://localhost:7331/user/checkPassword",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result).equals(true)
      done()
    })
  })

  it('FAILS to check user password without token', done => {
    const headers = { }
    const data = `password=doe`

    getData("http://localhost:7331/user/checkPassword",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals("ERROR : Missing Bearer token in your Authorizations")
      done()
    })
  })

  it('FAILS to check user password with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const getUser = await UserController.checkPassword(
      { headers: { authorization: `Bearer ${falseToken}`} },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(getUser).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('GETS one user', done => {
    getData("http://localhost:7331/user/get",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.nickname).equals('john')
      expect(result.email).equals('johndoe@gmail.com')
      expect(result.password).equals(undefined)
      done()
    })
  })

  it('READS the previously created user successfully', done => {
    getData("http://localhost:7331/user/getAll",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.users.length).equals(2)
      expect(result.users[0].nickname).equals("nonadmin")
      expect(result.users[0].email).equals("nonadmin@gmail.com")
      expect(result.users[0].role).equals("REGULAR")
      done()
    })
  })

  it('GETS one user', done => {
    getData("http://localhost:7331/user/get",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.nickname).equals('john')
      expect(result.email).equals('johndoe@gmail.com')
      expect(result.password).equals(undefined)
      done()
    })
  })

  it('FAILS to get one user without token', async done => {
    const getUser = await UserController.getUser(
      { headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(getUser.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to get one user with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const getUser = await UserController.getUser(
      { headers: { authorization: `Bearer ${falseToken}`} },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(getUser).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('GETS user buckets', done => {
    getData("http://localhost:7331/user/getBuckets",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(JSON.stringify(result)).equals(JSON.stringify({ list: ["updatedblobbucket"] }))
      done()
    })
  })

  it('FAILS to get user buckets without token', async done => {
    const getBuckets = await UserController.getBuckets(
      { headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(getBuckets.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to get user buckets with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const getUser = await UserController.getBuckets(
      { headers: { authorization: `Bearer ${falseToken}`} },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(getUser).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('UPDATES the previously created user successfully', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData(`http://localhost:7331/user/edit`,
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.id).equals(userToken.id)
      expect(result.nickname).equals("jack")
      expect(result.email).equals("johndoe@gmail.com")
      expect(result.role).equals("ADMIN")
      done()
    })
  })

  it('UPDATES other fields of the previously created user successfully', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'email=jack@gmail.com&password=jack'
    getData(`http://localhost:7331/user/edit`,
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.nickname).equals('jack')
      expect(result.email).equals('jack@gmail.com')
      done()
    })
  })

  it('FAILS to update one user without token', async done => {
    const update = await UserController.editUser(
      { body: { nickname: 'failuser'}, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(update.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to update one user with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const update = await UserController.editUser(
      { body: { nickname: 'failuser'}, headers: { authorization: `Bearer ${falseToken}` } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(update).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('DELETES the previously created user successfully', done => {
    getData(`http://localhost:7331/user/delete`,
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(JSON.stringify(result))
      .equals(JSON.stringify({ raw:[], affected: 1 }))
      done()
    })
  })

  it('FAILS to delete one user without token', async done => {
    const deleteUser = await UserController.deleteUser(
      { headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(deleteUser.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to delete one user with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const deleteUser = await UserController.deleteUser(
      { body: { nickname: 'failuser'}, headers: { authorization: `Bearer ${falseToken}` } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(deleteUser).equals("ERROR: User doesn't exists in database")
    done()
  })
}

export default userSecuredRoutes
