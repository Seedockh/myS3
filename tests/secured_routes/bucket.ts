import { expect } from 'chai'
import { token, userToken, getData } from '../main.test'
import * as jwt from 'jsonwebtoken'
import BucketController from '../../src/controllers/BucketController'

const bucketSecuredRoutes = (): void => {
  it('CREATES one bucket successfully', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = `name=firstbucket`

    getData("http://localhost:7331/bucket/createNew",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.name).equals("firstbucket")
      expect(result.user.id).not.to.be.undefined
      done()
    })
  })

  it('FAILS to create one bucket with wrong request', async done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=failbucket'

    await getData("http://localhost:7331/bucket/createNew",
    { method: 'POST', headers: headers, body: data }).then(result => {
      expect(result.message).contains("not-null constraint")
      done()
    })
  })

  it('FAILS to create one bucket without token', async done => {
    const create = await BucketController.createBucket(
      { body: { name: 'failbucket'}, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(create.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to create one bucket with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const create = await BucketController.createBucket(
      { body: { name: 'failbucket'}, headers: { authorization: `Bearer ${falseToken}` } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(create).equals("ERROR: User doesn't exists in database")
    done()
  })

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
    const data = `name=updatedbucket&userUuid=${userToken.id}`
    getData(`http://localhost:7331/bucket/edit/3`,
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.id).equals(3)
      expect(result.name).equals("updatedbucket")
      done()
    })
  })

  it('FAILS to update one bucket without token', async done => {
    const update = await BucketController.editBucket(
      { body: { name: 'failbucket'}, params: { id: 3 }, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(update.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to update one bucket with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const update = await BucketController.editBucket(
      { body: { name: 'failbucket'}, headers: { authorization: `Bearer ${falseToken}` }, params: { id: 3 } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(update).equals("ERROR: User doesn't exists in database")
    done()
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

  it('FAILS to delete one bucket with wrong token', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const deleteBucket = await BucketController.deleteBucket(
      { body: { name: 'failbucket'}, headers: { authorization: `Bearer ${falseToken}` }, params: { id: 3 } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(deleteBucket).equals("ERROR: User doesn't exists in database")
    done()
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

  it('FAILS to delete one bucket without token', async done => {
    const deleteBucket = await BucketController.deleteBucket(
      { params: { id: 3 }, headers: { } },
      { status: status => { return { send: message => message, status: status } } }
    )
    expect(deleteBucket.message).equals("ERROR : Missing Bearer token in your Authorizations")
    done()
  })

  it('FAILS to delete unexistent bucket', async done => {
    getData("http://localhost:7331/bucket/delete/999999",
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.message).equals("ERROR: Bucket doesn't exists in database")
      done()
    })
  })
}

export default bucketSecuredRoutes
