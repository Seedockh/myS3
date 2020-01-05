import { expect } from 'chai'
import { token, userToken, getData } from '../main.test'
import fetch from 'node-fetch'
import axios from 'axios'
import concat from 'concat-stream'
import fs from 'fs'
import * as jwt from 'jsonwebtoken'
import FormData from 'form-data'
import BlobController from '../../src/controllers/BlobController'
import FileManager from '../../src/services/filemanager'

const envFolder = new FileManager(process.platform)
envFolder.init('myS3DATA/tests')

const blobSecuredRoutes = (): void => {
  it('UPLOADS a new blob successfully', done => {
    getData("http://localhost:7331/bucket/createNew",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: `name=blobbucket`,
    })
    .then(bucket => {
      expect(bucket.name).equals("blobbucket")
      const stats = fs.statSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`)
      const file = fs.createReadStream(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`)

      let formData = new FormData()
      formData.append('mys3-upload', file)
      formData.pipe(concat(data => {
        axios.post(
          // URL
          `http://localhost:1337/blob/add/blobbucket`,
          // BODY
          data,
          // HEADERS
          { headers: {
              'Authorization': `Bearer ${token}`,
              ...formData.getHeaders()
            }
          })
        .then(uploadedFile => {
          expect(fs.existsSync(`${uploadedFile.data.path}${uploadedFile.data.name}`)).equals(true)
          done()
        })
      }))
    })
  })

  it('RETRIEVES a blob successfully', async done => {
    axios.get('http://localhost:7331/blob/retrieve/1', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.data).equals('This is a test file')
      done()
    })
  })

  it('GETS a blob infos successfully', async done => {
    getData(`http://localhost:7331/blob/getinfos/1`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then( result => {
      expect(result.id).equals(1)
      expect(/test-file-/.test(result.name)).equals(true)
      expect(result.bucket.name).equals('blobbucket')
      expect(/\/myS3DATA\/tests\//.test(result.path)).equals(true)
      expect(/\/blobbucket\//.test(result.path)).equals(true)
      expect(result.size).equals('19')
      done()
    })
  })

  it('DUPLICATES a blob successfully', async done => {
    let user = null
    getData(
      "http://localhost:7331/user/get",
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } },
    ).then(res => user = res)

    getData("http://localhost:7331/blob/duplicate/1", {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(result => {
      expect(/test-file-[0-9]+\.copy\.1\.txt/.test(result.name)).equals(true)
      expect(fs.existsSync(`${envFolder.defaultPath}/${user.id}/blobbucket/${result.name}`)).equals(true)
      done()
    })
  })

  it('DELETES a blob successfully', async done => {
    // Delete a blob
    // DELETE /delete/:id -> BlobController.deleteBlob
    getData("http://localhost:7331/blob/delete/1", {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(result => {
      expect(JSON.stringify(result)).equals(JSON.stringify({raw: [], affected: 1}))
      done()
    })
  })
}

export default blobSecuredRoutes
