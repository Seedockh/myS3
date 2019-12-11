import { expect } from 'chai'
import { token, getData } from '../main.test'

const userSecuredRoutes = (): void => {
  it('READS the previously created user successfully', done => {
    getData("http://localhost:7331/user/getAll",
    { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(result.users.length).equals(1)
      expect(result.users[0].uuid).equals(3)
      expect(result.users[0].nickname).equals("john")
      expect(result.users[0].email).equals("johndoe@gmail.com")
      expect(result.users[0].role).equals("ADMIN")
      done()
    })
  })

  it('FAILS to access to secure route with wrong User Role', done => {
    let headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    // This is a temporary data encoding solution because JSON problems
    let data = 'nickname=nonadmin&email=nonadmin@gmail.com&password=user&role=REGULAR'

    getData("http://localhost:7331/user/createNew",
    { method: 'POST', headers: headers, body: data })
    .then(() => {
      data = 'nickname=nonadmin&password=user'
      getData("http://localhost:7331/auth/login",
      { method: 'POST', headers: headers, body: data })
      .then(result => {
        const nonAdminToken = result.token
        getData("http://localhost:7331/user/getAll",
        { method: 'GET', headers: { 'Authorization': `Bearer ${nonAdminToken}` } })
        .then(res => {
          expect(res.message).equals(`ERROR: REGULAR Users are not authorized for this route`)
          done()
        })
      })
    })
  })

  it('UPDATES the previously created user successfully', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData("http://localhost:7331/user/edit/3",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.uuid).equals(3)
      expect(result.nickname).equals("jack")
      expect(result.email).equals("johndoe@gmail.com")
      expect(result.role).equals("ADMIN")
      done()
    })
  })

  it('FAILS to update non existent user', done => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
    // This is a temporary data encoding solution because JSON problems
    const data = 'nickname=jack'
    getData("http://localhost:7331/user/edit/99999",
    { method: 'PUT', headers: headers, body: data })
    .then(result => {
      expect(result.message).equals(`User doesn't exists in database`)
      done()
    })
  })

  it('DELETES the previously created user successfully', done => {
    getData("http://localhost:7331/user/delete/3",
    { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    .then(result => {
      expect(JSON.stringify(result))
      .equals(JSON.stringify({ raw:[], affected: 1 }))
      done()
    })
  })
}

export default userSecuredRoutes
