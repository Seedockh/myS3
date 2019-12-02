import { expect } from 'chai'
import express from 'express'
import fetch from 'node-fetch'
import { createConnection, getManager, getUserList, createUser, initializeConnection, UserInterface, Connection, Server, Repository } from 'typeorm'
import { app, server } from '../../src/main'
import User from '../../src/entity/User'

let testServer:Server
let connection:Connection
let userRepository: Repository<User>

beforeAll(async () => {
  testServer = app.listen(7331)
  connection = await createConnection()
  connection = await connection.synchronize(true).then(async () => {
    userRepository = await connection.getRepository(User)
  })
  return await userRepository
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
    return error
  }
}

describe(':: Database initialization', (): void => {
  it('checks UserInterface type', (done) => {
    const user:UserInterface =
    expect(UserInterface).equals(undefined)
    done()
  })

  it('initializes database connection', (done) => {
    getData("http://localhost:7331/", { method: 'GET' })
    .then(async result => {
      expect(testServer._connectionKey).contains('7331')
      expect(result.message).equal('Welcome on mys3 homepage !')
      done()
    })
  })
})

describe(':: User Entity CRUD tests', (): void => {
  it('CREATES and DELETES one User successfully', (done) => {
    let user:UserInterface = new User()
    user.nickname = 'Neo'
    user.email = 'neoanderson@gmail.com'
    user.password = 'Anderson'
    userRepository.save(user).then( dbUser => {
      expect(typeof dbUser.id).equal('number')
      expect(typeof dbUser.nickname).equal('string')
      expect(typeof dbUser.email).equal('string')
      expect(typeof dbUser.password).equal('string')

      userRepository.delete(1).then(result => {
        expect(JSON.stringify(result)).equal(JSON.stringify({ raw:[],  affected: 1 }))
        done()
      })
    })
  })
})

describe(':: API User CRUD tests', (): void => {
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
          id: 2,
          nickname: "john",
          email: "johndoe@gmail.com",
          password: "doe"
        })
      )
      done()
    })
  })

  /*it('FAILS to create incorrectly defined user', (done) => {
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
  })*/

  it('READS the previously created user successfully', (done) => {
    getData("http://localhost:7331/users",
    { method: 'GET' })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          users: [
              {
                id: 2,
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
    getData("http://localhost:7331/user/2",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          id: 2,
          nickname: "jack",
          email: "johndoe@gmail.com",
          password: "doe"
        })
      )
      done()
    })
  })

  it('DELETES the previously created user successfully', (done) => {
    getData("http://localhost:7331/user/2",
    { method: 'DELETE' })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(JSON.stringify({ raw:[], affected: 1 }))
      done()
    })
  })
})
