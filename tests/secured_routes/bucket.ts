import { expect } from 'chai'
import { token, userToken, getData } from '../main.test'

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

  /*it('FAILS to create one bucket with wrong user', async done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = `name=failbucket`

    await getData("http://localhost:7331/bucket/createNew",
    { method: 'POST', headers: headers, body: data }).then(result => {
      expect(result.message).equals("User doesn't exists in database")
      done()
    })
  })*/

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

  it('FAILS to update with non existent user', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = `name=updatebucket&userUuid=00000000-0000-0000-0000-000000000000`
    getData("http://localhost:7331/bucket/edit/3",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals(`User doesn't exists in database`)
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
}

export default bucketSecuredRoutes
