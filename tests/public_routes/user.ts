import { expect } from 'chai'
import { getData } from '../main.test'
import UserController from '../../src/controllers/UserController'

const userPublicRoutes = (): void => {
  it('CREATES a user to reset pw successfully', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack&email=jack@gmail.com&password=jack&role=ADMIN'

    getData("http://localhost:7331/user/createNew",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.nickname).equals("jack")
      expect(result.email).equals("jack@gmail.com")
      expect(result.role).equals("ADMIN")
      done()
    })
  })

  it('CREATES one user successfully', done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&email=johndoe@gmail.com&password=doe&role=ADMIN'

    getData("http://localhost:7331/user/createNew",
    { method: 'POST', headers: headers, body: data })
    .then(result => {
      expect(result.nickname).equals("john")
      expect(result.email).equals("johndoe@gmail.com")
      expect(result.role).equals("ADMIN")
      done()
    })
  })

  it('FAILS to create one user with wrong request', async done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=john&email=johndoe@gmail.com'

    const user = await getData("http://localhost:7331/user/createNew",
    { method: 'POST', headers: headers, body: data }).then(result => {
      expect(result.message).contains('not-null constraint')
      done()
    })
  })

  it('RESET user password', async done => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    const data = 'email=jack@gmail.com'

    getData(`http://localhost:7331/user/generatePwMail`, 
    { method: 'PUT', headers: headers, body: data }).then(result => {
      expect(result.message).equals("Request password mail was sent")
      done()
    })
  })
}

export default userPublicRoutes
