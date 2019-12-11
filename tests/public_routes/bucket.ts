import { expect } from 'chai'
import { getData } from '../main.test'

const bucketPublicRoutes = (): void => {
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
    const data = 'nickname=failbucket&userUuid=3'

    await getData("http://localhost:7331/bucket/createNew",
    { method: 'POST', headers: headers, body: data }).then(result => {
      expect(result.message).contains("not-null constraint")
      done()
    })
  })

  it('FAILS to create one bucket with wrong user', async done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'name=failbucket&userUuid=42'

    await getData("http://localhost:7331/bucket/createNew",
    { method: 'POST', headers: headers, body: data }).then(result => {
      expect(result.message).equals("User doesn't exists in database")
      done()
    })
  })
}

export default bucketPublicRoutes
