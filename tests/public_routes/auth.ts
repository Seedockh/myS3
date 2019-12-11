import { expect } from 'chai'
import { token, getData } from '../main.test'

const authRoutes = (): void => {
  it('FAILS to login with undefined secret', done => {
    const env = process.env
    process.env = { }
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&password=doe'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('jwt_secret is undefined')
      process.env = env
      done()
    })
  })

  it('FAILS to login with missing credentials', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'password=doe'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('Login failed : missing credentials.')
      done()
    })
  })

  it('FAILS to login with wrong credentials', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=johnny&password=doe'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('Login failed : wrong credentials.')
      done()
    })
  })

  it('FAILS to login with wrong password', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&password=doherty'

    getData("http://localhost:7331/auth/login",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals('Login failed : wrong password.')
      done()
    })
  })
}

export default authRoutes
