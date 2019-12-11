import { expect } from 'chai'
import { getData } from '../main.test'

const checkRole = (): void => {
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

}

export default checkRole
