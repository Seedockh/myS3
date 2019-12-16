import { expect } from 'chai'
import { token } from '../main.test'
import * as jwt from 'jsonwebtoken'
import Authentifier from '../../src/services/authentifier'

const authentifier = (): void => {
  it('AUTHENTICATES correct user token', async done => {
    const auth = new Authentifier(token)
    const authUser = await auth.getUser()
    expect(authUser.user).not.to.be.undefined
    expect(authUser.message).equals(undefined)
    done()
  })

  it('FAILS to authenticate without JWT_SECRET', async done => {
    const backupEnv = process.env
    process.env = {}
    const auth = new Authentifier(token)
    const authUser = await auth.getUser()
    expect(authUser.user).equals(undefined)
    expect(authUser.message).equals('ERROR: Missing secret in your .env file')
    process.env = backupEnv
    done()
  })

  it('FAILS to authenticate with wrong token', async done => {
    const auth = new Authentifier(token+'0')
    const authUser = await auth.getUser()
    expect(authUser.user).equals(undefined)
    expect(authUser.message).equals('ERROR: Wrong token sent')
    done()
  })

  it('FAILS to authenticate with token of undefined user', async done => {
    const falseToken: string = jwt.sign(
      { userId: 'cd1efe69-6735-403b-a47d-f585042d271e', username: 'johnny' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )
    const auth = new Authentifier (falseToken)
    const authUser = await auth.getUser()
    expect(authUser.user).equals(undefined)
    expect(authUser.message).equals("ERROR: User doesn't exists in database")
    done()
  })
}

export default authentifier
