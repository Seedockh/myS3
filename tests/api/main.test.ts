import { expect } from 'chai'
import express from 'express'
import fetch from 'node-fetch'
import fs from 'fs'
import { createConnection, getManager, getConnection, Connection, Server, Repository } from 'typeorm'
import { initializeConnection, app, server, getEnvFolder } from '../../src/main'
import UserController from '../../src/controllers/UserController'
import User from '../../src/entity/User'
import BucketController from '../../src/controllers/BucketController'
import Bucket from '../../src/entity/Bucket'

let testServer:Server
let connection:Connection
let userRepository: Repository<User>
let bucketRepository: Repository<Bucket>
let token: string

beforeAll(async () => {
  testServer = await app.listen(7331)
  connection = await createConnection()
  connection = await connection.synchronize(true).then(async () => {
    userRepository = await connection.getRepository(User)
    bucketRepository = await connection.getRepository(Bucket)
  })
  return await [userRepository, bucketRepository]
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
  it('FAILS to create bad database connection', async () => {
    expect((await initializeConnection('fail')).name).equals('error')
  })

  it('RETURNS correct environment folder', done => {
    const dataDir = getEnvFolder(process.platform, 'myS3DATA/tests')
    expect(fs.existsSync(dataDir)).equals(true)

    fs.rmdirSync(dataDir)
    expect(fs.existsSync(dataDir)).equals(false)

    expect(getEnvFolder('linux', 'myS3DATA/tests')).equals(`${process.env.HOME}/myS3DATA/tests`)
    expect(getEnvFolder('darwin', 'myS3DATA/tests')).equals(`${process.env.HOME}/Library/Preferences/myS3DATA/tests`)
    expect(getEnvFolder('windows', 'myS3DATA/tests')).equals(`${process.env.HOME}/myS3DATA/tests`)

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

describe(':: User Entity tests', (): void => {
  it('INSTANTIATES correctly a new User model', done => {
    const user = new User()
    expect(JSON.stringify(user)).equals(JSON.stringify({
      id: undefined,
      nickname: undefined,
      email: undefined,
      password: undefined
    }))
    done()
  })

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

describe(':: Bucket Entity tests', (): void => {
  it('INSTANTIATES correctly a new Bucket model', done => {
    const bucket = new Bucket()
    expect(JSON.stringify(bucket)).equals(JSON.stringify({
      id: undefined,
      name: undefined,
      userUuid: undefined
    }))
    done()
  })

  it('FAILS to create a bucket with wrong setup', async done => {
    let bucket = new Bucket()
    bucket.name = null
    bucketRepository.save(bucket).then().catch(error => {
      expect(error.message).contains('not-null constraint')
      done()
    })
  })

  it('CREATES and DELETES one Bucket successfully', done => {
    let bucket = new Bucket()
    bucket.name = 'First bucket'
    bucketRepository.save(bucket).then( dbBucket => {
      expect(typeof dbBucket.id).equals('number')
      expect(typeof dbBucket.name).equals('string')

      bucketRepository.delete(2).then(result => {
        expect(JSON.stringify(result)).equals(JSON.stringify({ raw:[],  affected: 1 }))
        done()
      })
    })
  })
})

describe(':: API Secured routes tests', (): void => {
  it('FAILS to access to secure route if jwt_secret is undefined', done => {
    const env = process.env
    process.env = { }
    getData("http://localhost:7331/user/getAll",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}ee` } })
    .then(result => {
      expect(result.message).equals('ERROR: jwt_secret is undefined')
      process.env = env
      done()
    })
  })

  it('FAILS to access to secure route when jwt.verify() fails', done => {
    getData("http://localhost:7331/user/getAll",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}ee` } })
    .then(result => {
      expect(result.message).equals('ERROR: Wrong token sent')
      done()
    })
  })

  it('FAILS to access to secure route when Bearer token not sent', done => {
    getData("http://localhost:7331/user/getAll",
    { method: 'GET' })
    .then(result => {
      expect(result.message).equals('ERROR: Bearer token is undefined')
      done()
    })
  })
})

describe(':: API User Unsecured routes tests', (): void => {
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
})

describe(':: API Bucket Unsecured routes tests', (): void => {
  it('CREATES one bucket successfully', done => {

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = `name=firstbucket&userUuid=3`

    getData("http://localhost:7331/bucket/createNew",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.name).equals("firstbucket")
      expect(result.user.uuid).equals(3)
      done()
    })
  })

  it('FAILS to create one bucket with wrong request', async done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'name=failbucket&userUuid=42'

    const user = await getData("http://localhost:7331/bucket/createNew",
    { method: 'POST', headers: headers, body: data }).then(result => {
      expect(result.message).equals("User doesn't exists in database")
      done()
    })
  })
})


describe(':: API Authentification routes tests', (): void => {
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

  it('FAILS to login with undefined secret', done => {
    const env = process.env
    process.env = { }
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&password=doe'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('jwt_secret is undefined')
      process.env = env
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
})

describe(':: API Bucket Secured routes tests', (): void => {
  it('READS the previously created bucket successfully', done => {
    getData("http://localhost:7331/bucket/getAll",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.buckets.length).equals(1)
      expect(result.buckets[0].id).equals(3)
      expect(result.buckets[0].name).equals("firstbucket")
      done()
    })
  })

  it('UPDATES the previously created bucket successfully', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'name=updatedbucket'
    getData("http://localhost:7331/bucket/edit/3",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.id).equals(3)
      expect(result.name).equals("updatedbucket")
      done()
    })
  })

  it('FAILS to update non existent bucket', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'name=updatebucket'
    getData("http://localhost:7331/bucket/edit/99999",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals(`Bucket doesn't exists in database`)
      done()
    })
  })

  it('DELETES the previously created bucket successfully', done => {
    getData("http://localhost:7331/bucket/delete/3",
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(JSON.stringify(result))
      .equals(JSON.stringify({ raw:[], affected: 1 }))
      done()
    })
  })
})

describe(':: API User Secured routes tests', (): void => {
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

  it('FAILS to access to secure route with wrong User Role', done => {
    let headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    let data = 'nickname=nonadmin&email=nonadmin@gmail.com&password=user&role=REGULAR'

    getData("http://localhost:7331/user/createNew",
    { method: 'POST', headers: headers, body: data })
    .then(() => {
      data = 'nickname=nonadmin&password=user'
      getData("http://localhost:7331/auth/login",
      { method: 'POST', headers: headers, body: data })
      .then(result => {
        const nonAdminToken = result.token
        getData("http://localhost:7331/user/getAll",
        { method: 'GET', headers: { 'Authorization': `Bearer ${nonAdminToken}` } })
        .then(res => {
          expect(res.message).equals(`ERROR: REGULAR Users are not authorized for this route`)
          done()
        })
      })
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
