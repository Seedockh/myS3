import { expect } from 'chai'
import { token, userToken, getData, blobRepository } from '../main.test'
import fetch from 'node-fetch'
import axios from 'axios'
import concat from 'concat-stream'
import fs from 'fs'
import FormData from 'form-data'
import * as jwt from 'jsonwebtoken'
import BlobController from '../../src/controllers/BlobController'
import BucketController from '../../src/controllers/BucketController'
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

  it('FAILS to upload blob without token', async done => {
    const file = fs.createReadStream(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`)
    let formData = new FormData()
    formData.append('mys3-upload', file)
    formData.pipe(concat(async data => {
      const uploadBlob = await BlobController.addBlob(
        { params: { bucketName: 'blobbucket' }, headers: { ...formData.getHeaders() } },
        { status: status => { return { send: message => message, status: status } } }
      )
      expect(uploadBlob.message).equals("ERROR : Missing Bearer token in your Authorizations")
      done()
    }))
  })

  it('FAILS to upload blob in unexistent bucket', async done => {
    const uploadBlob = await BlobController.addBlob(
      { params: { bucketName: 'failingbucket' }, headers: { authorization: `Bearer ${token}` } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(uploadBlob.message).equals("Bucket doesn't exists in database")
    done()
  })

  it('FAILS to upload empty blob with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const uploadBlob = await BlobController.addBlob(
      { params: { bucketName: 'blobbucket' }, headers: { authorization: `Bearer ${falseToken}` } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(uploadBlob).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('FAILS to upload empty blob with bad headers', async done => {
    axios.post(
      // URL
      `http://localhost:1337/blob/add/blobbucket`,
      // BODY
      {},
      // HEADERS
      { headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })
    .then(response => {
      expect(response.data.message).equals('ERROR: Error: Multipart: Boundary not found')
      done()
    })
  })

  it('FAILS to upload unsent file with correct headers', async done => {
    const file = fs.readFileSync(`${envFolder.defaultPath}/testuser/testbucket/test-file.txt`)

    let formData = new FormData()
    formData.append('mys3-upload', file)

    axios.post(
      // URL
      `http://localhost:1337/blob/add/blobbucket`,
      // BODY
      formData,
      // HEADERS
      { headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      })
    .then(response => {
      expect(response.data.message).equals('Please select a file to upload')
      done()
    })
  })

  it('SHARES a blob successfully', done => {
    getData(`http://localhost:7331/blob/getinfos/1`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(blob => {
      axios.get('http://localhost:7331/blob/share/1', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(file => {
        expect(file.data).equals(blob.name)
        expect(fs.existsSync(`${envFolder.defaultPath}/public/${blob.name}`)).equals(true)
        done()
      })
    })
  })

  it('FAILS to share a blob without token', async done => {
    const shareBlob = await BlobController.shareBlob(
      { params: { id: 1 }, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(shareBlob.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to share a blob with false token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const shareBlob = await BlobController.shareBlob(
      { params: { id: 1 }, headers: { authorization: `Bearer ${falseToken}` } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(shareBlob).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('FAILS to share unexistent blob', async done => {
    const shareBlob = await BlobController.shareBlob(
      { params: { id: 99999 }, headers: { authorization: `Bearer ${token}` } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(shareBlob.message).equals("ERROR: File doesn't exists in database")
    done()
  })

  it('RETRIEVES a public blob successfully', async done => {
    getData(`http://localhost:7331/blob/getinfos/1`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    })
    .then(blob => {
      axios.get(`http://localhost:7331/blob/public/${blob.name}`)
      .then(result => {
        expect(result.data).equals('This is a test file')
        done()
      })
    })
  })

  it('FAILS to retrieve a public blob successfully', async done => {
    getData("http://localhost:7331/blob/public/failing-file.txt",
    { method: 'GET' }).then(result => {
      expect(result.message).equals("This file does not exist.")
      done()
    })
  })

  it('UPDATES the path of blob when renaming bucket', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    const data = `name=updatedblobbucket&userUuid=${userToken.id}`
    getData(`http://localhost:7331/bucket/edit/blobbucket`,
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.blobs[0].path).equals(`${envFolder.defaultPath}/${userToken.id}/updatedblobbucket/`)
      done()
    })
  })

  it('RETRIEVES a blob successfully', async done => {
    axios.get('http://localhost:7331/blob/retrieve/1', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.data).equals('This is a test file')
      done()
    })
  })

  it('FAILS to retrieve blob without token', async done => {
    const retrieveBlob = await BlobController.retrieveBlob(
      { params: { id: 1 }, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(retrieveBlob.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to retrieve one blob with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const retrieveBlob = await BlobController.retrieveBlob(
      { body: {}, headers: { authorization: `Bearer ${falseToken}` }, params: { id: 1 } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(retrieveBlob).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('FAILS to retrieve unexistent blob', async done => {
    getData("http://localhost:7331/blob/retrieve/9999",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.message).equals("ERROR: File doesn't exists in database")
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
      expect(result.bucket.name).equals('updatedblobbucket')
      expect(/\/myS3DATA\/tests\//.test(result.path)).equals(true)
      expect(/\/updatedblobbucket\//.test(result.path)).equals(true)
      expect(result.size).equals('19')
      done()
    })
  })

  it('FAILS to get blob without token', async done => {
    const getBlob = await BlobController.getBlobInfos(
      { params: { id: 1 }, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(getBlob.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to get one blob with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const getBlob = await BlobController.getBlobInfos(
      { body: {}, headers: { authorization: `Bearer ${falseToken}` }, params: { id: 1 } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(getBlob).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('FAILS to get unexistent blob', async done => {
    getData("http://localhost:7331/blob/getinfos/9999",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.message).equals("ERROR: File doesn't exists in database")
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
      expect(fs.existsSync(`${envFolder.defaultPath}/${user.id}/updatedblobbucket/${result.name}`)).equals(true)
      done()
    })
  })

  it('FAILS to retrieve a blob of which file has been manually deleted', done => {
    getData("http://localhost:7331/blob/getinfos/2",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(file => {
      const pathParts = file.path.split('/')
      const userId = pathParts[pathParts.length-3]
      const manualDelete = envFolder.deleteFile(`${userId}/updatedblobbucket/${file.name}`)
      expect(manualDelete).equals(`File ${file.path}${file.name} deleted successfully.`)

      getData("http://localhost:7331/blob/retrieve/2",
      { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then(result => {
        expect(result.message).equals('This file does not exist.')
        done()
      })
    })
  })

  it('FAILS to duplicate blob without token', async done => {
    const duplicateBlob = await BlobController.duplicateBlob(
      { params: { id: 1 }, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(duplicateBlob.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to duplicate one blob with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const duplicateBlob = await BlobController.duplicateBlob(
      { body: {}, headers: { authorization: `Bearer ${falseToken}` }, params: { id: 1 } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(duplicateBlob).equals("ERROR: User doesn't exists in database")
    done()
  })

  it('FAILS to duplicate unexistent blob', async done => {
    getData("http://localhost:7331/blob/duplicate/9999",
    { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.message).equals("ERROR: File doesn't exists in database")
      done()
    })
  })

  it('FAILS to delete one blob with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const deleteBlob = await BlobController.deleteBlob(
      { body: {}, headers: { authorization: `Bearer ${falseToken}` }, params: { id: 1 } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(deleteBlob).equals("ERROR: User doesn't exists in database")
    done()
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

  it('FAILS to delete one blob without token', async done => {
    const deleteBlob = await BlobController.deleteBlob(
      { params: { id: 1 }, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(deleteBlob.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to delete unexistent blob', async done => {
    getData("http://localhost:7331/blob/delete/9999",
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.message).equals("ERROR: File doesn't exists in database")
      done()
    })
  })
}

export default blobSecuredRoutes
