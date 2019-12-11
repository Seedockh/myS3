import { expect } from 'chai'
import fetch from 'node-fetch'
import fs from 'fs'
import { createConnection, getConnection, Connection, Server, Repository } from 'typeorm'
import { initializeConnection, app, server, getEnvFolder } from '../src/main'
import User from '../src/entity/User'
import Bucket from '../src/entity/Bucket'

import mail from './services/mail'
import userEntity from './entities/User'
import bucketEntity from './entities/Bucket'
import checkJwt from './middlewares/checkJwt'
import userPublicRoutes from './public_routes/user'
import bucketPublicRoutes from './public_routes/bucket'
import authRoutes from './public_routes/auth'
import bucketSecuredRoutes from './secured_routes/bucket'
import userSecuredRoutes from './secured_routes/user'

/*============== TESTS SETUPS =====================*/
/*=================================================*/
let testServer:Server
let connection:Connection
export let userRepository: Repository<User>
export let bucketRepository: Repository<Bucket>
export let token: string
export const getData = async (url, options) => {
  try {
    const response = await fetch(url, options)
    return response.json()
  } catch (error) { return error }
}

/*------------------------------------------------*/
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
/*=================================================*/



/*=============== SETUP TESTS =====================*/
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
/*=================================================*/


/*========= CALLING ALL TESTSUITES ================*/
/*===*/ describe(':: User Entity tests', userEntity)
/*===*/ describe(':: Bucket Entity tests', bucketEntity)
/*===*/ describe(':: CheckJwt routes tests', checkJwt)
/*===*/ describe(':: User public routes tests', userPublicRoutes)
/*===*/ describe(':: Bucket public routes tests', bucketPublicRoutes)

/*===*/ describe(':: Authentication for tests', ():void => {
/*===*/  it('LOGS IN successfully', done => {
/*===*/    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
/*===*/    const data = 'nickname=john&password=doe'

/*===*/    getData("http://localhost:7331/auth/login",
/*===*/    { method: 'POST', headers: headers, body: data })
/*===*/    .then(result => {
/*===*/      expect(!result.token).equals(false)
/*===*/      token = result.token
/*===*/      done()
/*===*/    })
/*===*/  })
/*===*/})

/*===*/ describe(':: Authentication routes tests', authRoutes)
/*===*/ describe(':: Bucket secured routes tests', bucketSecuredRoutes)
/*===*/ describe(':: User secured routes tests', userSecuredRoutes)
/*===*/ describe(':: Mailing tests', mail)
/*=================================================*/
