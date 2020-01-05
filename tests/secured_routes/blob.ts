import { expect } from 'chai'
import { token, userToken, getData } from '../main.test'
import fetch from 'node-fetch'
import fs from 'fs'
import * as jwt from 'jsonwebtoken'
import BlobController from '../../src/controllers/BlobController'

const blobSecuredRoutes = (): void => {
  it('RETRIEVES a blob successfully', async done => {
    done()
  })

  it('GETS a blob infos successfully', async done => {
    done()
  })

  it('UPLOADS a new blob successfully', async done => {
    done()
  })

  it('DUPLICATES a blob successfully', async done => {
    done()
  })

  it('DELETES a blob successfully', async done => {
    done()
  })
}

export default blobSecuredRoutes
