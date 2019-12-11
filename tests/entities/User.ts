import { expect } from 'chai'
import { userRepository } from '../main.test'
import User from '../../src/entity/User'

const userEntity = (): void => {
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

  it('FAILS to create a user with wrong setup', async done => {
    let user:UserInterface = new User()
    user.nickname = 'Neo'
    user.email = 'neoanderson@gmail.com'
    userRepository.save(user).then().catch(error => {
      expect(error.message).contains('not-null constraint')
      done()
    })
  })

  it('CREATES and DELETES one User successfully', done => {
    let user:UserInterface = new User()
    user.nickname = 'Neo'
    user.email = 'neoanderson@gmail.com'
    user.password = 'Anderson'
    user.role = 'ADMIN'
    userRepository.save(user).then( dbUser => {
      expect(typeof dbUser.uuid).equals('number')
      expect(typeof dbUser.nickname).equals('string')
      expect(typeof dbUser.email).equals('string')
      expect(typeof dbUser.password).equals('string')
      expect(typeof dbUser.role).equals('string')

      userRepository.delete(2).then(result => {
        expect(JSON.stringify(result)).equals(JSON.stringify({ raw:[],  affected: 1 }))
        done()
      })
    })
  })
}

export default userEntity
