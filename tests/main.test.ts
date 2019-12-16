import { expect } from 'chai'
import fetch from 'node-fetch'
import fs from 'fs'
import * as jwt from 'jsonwebtoken'
import { createConnection, getConnection, Connection, Server, Repository } from 'typeorm'
import { initializeConnection, app, server, getEnvFolder } from '../src/main'
import User from '../src/entity/User'
import Bucket from '../src/entity/Bucket'
import FileManager from '../src/services/filemanager'

import mail from './services/mail'
import authentifier from './services/authentifier'
import filemanager from './services/filemanager'
import userEntity from './entities/User'
import bucketEntity from './entities/Bucket'
import checkJwt from './middlewares/checkJwt'
import checkRole from './middlewares/checkRole'
import userPublicRoutes from './public_routes/user'
import authRoutes from './public_routes/auth'
import bucketSecuredRoutes from './secured_routes/bucket'
import userSecuredRoutes from './secured_routes/user'

/*============== TESTS SETUPS =====================*/
let testServer:Server
let connection:Connection
export let userRepository: Repository<User>
export let bucketRepository: Repository<Bucket>
export let token: string
export let userToken: User | undefined
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
    const dataDir = new FileManager(process.platform).init('myS3DATA/tests')
    expect(fs.existsSync(dataDir)).equals(true)

    fs.rmdirSync(dataDir, { recursive: true })
    expect(fs.existsSync(dataDir)).equals(false)

    expect(new FileManager('linux').init('myS3DATA/tests'))
      .equals(`${process.env.HOME}/myS3DATA/tests`)

    expect(new FileManager('darwin').init('myS3DATA/tests'))
      .equals(`${process.env.HOME}/Library/Preferences/myS3DATA/tests`)

    expect(new FileManager('windows').init('myS3DATA/tests'))
      .equals(`${process.env.HOME}/myS3DATA/tests`)

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
/*===*/ describe(':: CheckRole routes tests', checkRole)
/*===*/ describe(':: User public routes tests', userPublicRoutes)

/*===*/ describe(':: Authentication for tests', ():void => {
/*===*/  it('LOGS IN successfully', done => {
/*===*/    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
/*===*/    const data = 'nickname=john&password=doe'

/*===*/    getData("http://localhost:7331/auth/login",
/*===*/    { method: 'POST', headers: headers, body: data })
/*===*/    .then( async result => {
/*===*/      expect(!result.token).equals(false)

/*===*/      token = result.token
/*===*/      let jwtPayload

/*===*/      jwt.verify(token, process.env.JWT_SECRET,
/*===*/      (err, data) => err ? res.status(403).send({ message: 'ERROR: Wrong token sent'}) : jwtPayload = data )
/*===*/      userToken = await userRepository.findOne({
/*===*/         where: { id: JSON.parse(JSON.stringify(jwtPayload)).userId },
/*===*/      })
/*===*/      done()
/*===*/    })
/*===*/  })
/*===*/})
/*===*/ describe(':: Authentication routes tests', authRoutes)
/*===*/ describe(':: Authentifier tests', authentifier)
/*===*/ describe(':: FileManager tests', filemanager)
/*===*/ describe(':: Bucket secured routes tests', bucketSecuredRoutes)
/*===*/ describe(':: User secured routes tests', userSecuredRoutes)
/*===*/ describe(':: Mailing tests', mail)
/*=================================================*/
