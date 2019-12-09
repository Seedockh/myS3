import { expect } from 'chai'
import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs'
import { createConnection, getManager, getConnection, Connection, Server, Repository } from 'typeorm'
import { app, server, getUserList, createUser, initializeConnection, getEnvFolder } from '../../src/main'
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
    return response.json()
  } catch (error) {
    return error
  }
}

describe(':: Database & Environment initialization', (): void => {
  it('FAILS to create second default database connection', done => {
    initializeConnection().then( res => {
      expect(res.message).equals('Cannot create a new connection named "default", because connection with such name already exist and it now has an active connection session.')
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

  it('CHECKS database connection and data folder are initialized', done => {
    getData("http://localhost:7331/", { method: 'GET' })
    .then(async result => {
      expect(testServer._connectionKey).contains('7331')
      expect(result.message).equal('Welcome on mys3 homepage !')
      done()
    })
  })
})

describe(':: User Model tests', (): void => {
  it('FAILS to create a user with wrong setup', async done => {
    const user = await createUser(getConnection(), 'Jack', 'Sparrow')
    expect(user.message).contains('null value in column "password"')
    done()
  })

  it('CREATES and DELETES one User successfully', done => {
    let user:UserInterface = new User()
    user.nickname = 'Neo'
    user.email = 'neoanderson@gmail.com'
    user.password = 'Anderson'
    userRepository.save(user).then( dbUser => {
      expect(typeof dbUser.id).equal('number')
      expect(typeof dbUser.nickname).equal('string')
      expect(typeof dbUser.email).equal('string')
      expect(typeof dbUser.password).equal('string')

      userRepository.delete(2).then(result => {
        expect(JSON.stringify(result)).equal(JSON.stringify({ raw:[],  affected: 1 }))
        done()
      })
    })
  })
})

describe(':: API User CRUD tests', (): void => {
  it('CREATES one user successfully', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&email=johndoe@gmail.com&password=doe'

    getData("http://localhost:7331/user",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          id: 3,
          nickname: "john",
          email: "johndoe@gmail.com",
          password: "doe"
        })
      )
      done()
    })
  })

  it('FAILS to create one user with wrong request', async done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&email=johndoe@gmail.com'

    const user = await getData("http://localhost:7331/user",
    { method: 'POST', headers: headers, body: data }).then( result => {
      expect(result.message).equals('null value in column "password" violates not-null constraint')
      done()
    })
  })

  it('READS the previously created user successfully', done => {
    getData("http://localhost:7331/users",
    { method: 'GET' })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          users: [
              {
                id: 3,
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

  it('UPDATES the previously created user successfully', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData("http://localhost:7331/user/3",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(
        JSON.stringify({
          id: 3,
          nickname: "jack",
          email: "johndoe@gmail.com",
          password: "doe"
        })
      )
      done()
    })
  })

  it('FAILS to update non existent user', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData("http://localhost:7331/user/99999",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.message).equal(`User doesn't exists in database`)
      done()
    })
  })

  it('DELETES the previously created user successfully', done => {
    getData("http://localhost:7331/user/3",
    { method: 'DELETE' })
    .then(result => {
      expect(JSON.stringify(result))
      .equal(JSON.stringify({ raw:[], affected: 1 }))
      done()
    })
  })
})
