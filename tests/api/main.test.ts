import { expect } from 'chai'
import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs'
import { createConnection, getManager, getConnection, Connection, Server, Repository } from 'typeorm'
import { app, server, getEnvFolder } from '../../src/main'
import UserController from '../../src/controllers/UserController'
import User from '../../src/entity/User'

let testServer:Server
let connection:Connection
let userRepository: Repository<User>
let token: string

beforeAll(async () => {
  testServer = await app.listen(7331)
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
    return response.json()
  } catch (error) {
    return error
  }
}

describe(':: Database & Environment initialization', (): void => {
  it('FAILS to create second default database connection', done => {
    createConnection().then().catch( error => {
      expect(JSON.stringify(error)).contains('AlreadyHasActiveConnectionError')
      done()
    })
  })

  it('RETURNS correct environment folder', done => {
    const dataDir = getEnvFolder(process.platform, 'myS3DATA/tests')
    expect(fs.existsSync(dataDir)).equals(true)

    fs.rmdirSync(dataDir)
    expect(fs.existsSync(dataDir)).equals(false)

    expect(getEnvFolder('linux', 'myS3DATA/tests')).equals(`${process.env.HOME}/myS3DATA/tests`)
    expect(getEnvFolder('darwin', 'myS3DATA/tests')).equals(`${process.env.HOME}/Library/Preferences/myS3DATA/tests`)
    expect(getEnvFolder('windows', 'myS3DATA/tests')).equals(`${process.env.HOME}/.local/share/myS3DATA/tests`)

    expect(fs.existsSync(dataDir)).equals(true)

    done()
  })

  it('CHECKS database connection is initialized', done => {
    getData("http://localhost:7331/", { method: 'GET' })
    .then(async result => {
      expect(testServer._connectionKey).contains('7331')
      expect(result.message).equals('Welcome on mys3 homepage !')
      done()
    })
  })
})

describe(':: User Model tests', (): void => {
    it('FAILS to create a user with wrong setup', async done => {
      let user:UserInterface = new User()
      user.nickname = 'Neo'
      user.email = 'neoanderson@gmail.com'
      userRepository.save(user).then().catch(error => {
        expect(error.message).contains('not-null constraint')
        done()
      })
    })

  it('CREATES and DELETES one User successfully', done => {
    let user:UserInterface = new User()
    user.nickname = 'Neo'
    user.email = 'neoanderson@gmail.com'
    user.password = 'Anderson'
    user.role = 'ADMIN'
    userRepository.save(user).then( dbUser => {
      expect(typeof dbUser.uuid).equals('number')
      expect(typeof dbUser.nickname).equals('string')
      expect(typeof dbUser.email).equals('string')
      expect(typeof dbUser.password).equals('string')
      expect(typeof dbUser.role).equals('string')

      userRepository.delete(2).then(result => {
        expect(JSON.stringify(result)).equals(JSON.stringify({ raw:[],  affected: 1 }))
        done()
      })
    })
  })
})

describe(':: API User CRUD tests', (): void => {
  it('CREATES one user successfully', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&email=johndoe@gmail.com&password=doe&role=ADMIN'

    getData("http://localhost:7331/user/createNew",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.nickname).equals("john")
      expect(result.email).equals("johndoe@gmail.com")
      expect(result.role).equals("ADMIN")
      done()
    })
  })

  it('FAILS to create one user with wrong request', async done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&email=johndoe@gmail.com'

    const user = await getData("http://localhost:7331/user/createNew",
    { method: 'POST', headers: headers, body: data }).then(result => {
      expect(result.message).contains('not-null constraint')
      done()
    })
  })

  it('LOGS IN successfully', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&password=doe'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(!result.token).equals(false)
      token = result.token
      done()
    })
  })

  it('FAILS to login with missing credentials', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'password=doe'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('Login failed : missing credentials.')
      done()
    })
  })

  it('FAILS to login with wrong credentials', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=johnny&password=doe'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('Login failed : wrong credentials.')
      done()
    })
  })

  it('FAILS to login with wrong password', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&password=doherty'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('Login failed : wrong password.')
      done()
    })
  })

  it('READS the previously created user successfully', done => {
    getData("http://localhost:7331/user/getAll",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.users.length).equals(1)
      expect(result.users[0].uuid).equals(3)
      expect(result.users[0].nickname).equals("john")
      expect(result.users[0].email).equals("johndoe@gmail.com")
      expect(result.users[0].role).equals("ADMIN")
      done()
    })
  })

  it('UPDATES the previously created user successfully', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData("http://localhost:7331/user/edit/3",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.uuid).equals(3)
      expect(result.nickname).equals("jack")
      expect(result.email).equals("johndoe@gmail.com")
      expect(result.role).equals("ADMIN")
      done()
    })
  })

  it('FAILS to update non existent user', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData("http://localhost:7331/user/edit/99999",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals(`User doesn't exists in database`)
      done()
    })
  })

  it('DELETES the previously created user successfully', done => {
    getData("http://localhost:7331/user/delete/3",
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(JSON.stringify(result))
      .equals(JSON.stringify({ raw:[], affected: 1 }))
      done()
    })
  })
})
