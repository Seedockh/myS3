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
      getData("http://localhost:7331/user/get",
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(user => {
        // Add a blob
        // POST /add/:bucketName -> BlobController.addBlob
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
  })

  it('RETRIEVES a blob successfully', async done => {
    // Retrieve a blob
    // GET /retrieve/:id -> BlobController.retrieveBlob
    /*getData("http://localhost:7331/blob/retrieve/1",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result).equals(1)
      done()
    })*/
    done()
  })

  it('GETS a blob infos successfully', async done => {
    // Get blob metadatas infos
    // GET /getinfos/:id -> BlobController.getBlobInfos

    done()
  })

  it('DUPLICATES a blob successfully', async done => {
    // Duplicate a blob
    // POST /duplicate/:id -> BlobController.duplicateBlob

    done()
  })

  it('DELETES a blob successfully', async done => {
    // Delete a blob
    // DELETE /delete/:id -> BlobController.deleteBlob

    done()
  })
}

export default blobSecuredRoutes
