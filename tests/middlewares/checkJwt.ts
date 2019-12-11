import { expect } from 'chai'
import { token, getData } from '../main.test'

const checkJwt = (): void => {
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
}

export default checkJwt
