import { expect } from 'chai'
import User from '../../src/entity/User'
import * as returns from '../../src/entity/entitiesReturns'

describe(':: User Entity tests', (): void => {
  it('INSTANTIATES correctly a new User model', done => {
    const user = new User()
    expect(JSON.stringify(user)).equals(JSON.stringify({
      id: undefined,
      nickname: undefined,
      email: undefined,
      password: undefined
    }))
    done()
  })
})
