import { expect } from 'chai'
import { createConnection, Connection, Server, Repository } from 'typeorm'
import { app, server } from '../src/main'
import fetch from 'node-fetch'

let testServer:Server
let connection:Connection

beforeAll(async () => {
  testServer = app.listen(7331)
  connection = await createConnection()
  connection = await connection.synchronize(true)
  return await connection
})

afterAll(async () => {
  await testServer.close()
  await server.close()
})

const getData = async (url, options) => {
  try {
    const response = await fetch(url, options)
    console.log('>>>>>>>> getData trying')
    return response.json()
  } catch (error) {
    console.log('>>>>>>>> getData error')
    return error
  }
}

describe(':: Database initialization', (): void => {
  it('initializes database connection', (done) => {
    getData("http://localhost:7331/", { method: 'GET' })
    .then(async result => {
      expect(result.message).equal('Welcome on mys3 homepage !')
      done()
    })
  })
})

describe(':: User CRUD tests', (): void => {
  it('CREATES one user successfully', (done) => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&email=johndoe@gmail.com&password=doe'

    getData("http://localhost:7331/user",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          id: 1,
          nickname: "john",
          email: "johndoe@gmail.com",
          password: "doe"
        })
      )
      done()
    })
  })

  it('FAILS to create incorrectly defined user', (done) => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'email=johndoe@gmail.com&password=doe'

    getData("http://localhost:7331/user",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      // it should never go there
      done()
    }).catch(error => {
      expect(JSON.stringify(error)).contains('aze')
      done()
    })
  })

  it('READS the previously created user successfully', (done) => {
    getData("http://localhost:7331/users",
    { method: 'GET' })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          users: [
              {
                id: 1,
                nickname: "john",
                email: "johndoe@gmail.com",
                password: "doe"
              }
          ]
        })
      )
      done()
    })
  })

  it('UPDATES the previously created user successfully', (done) => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData("http://localhost:7331/user/1",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          id: 1,
          nickname: "jack",
          email: "johndoe@gmail.com",
          password: "doe"
        })
      )
      done()
    })
  })

  it('DELETES the previously created user successfully', (done) => {
    getData("http://localhost:7331/user/1",
    { method: 'DELETE' })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(JSON.stringify({ raw:[], affected: 1 }))
      done()
    })
  })
})
