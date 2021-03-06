import * as jwt from 'jsonwebtoken'
import User from '../entity/User'
import { getRepository, Repository } from 'typeorm'

interface AuthResponse {
  message: string | undefined
  user: User | undefined
}

export default class Authentifier {
  token: string
  repository: Repository<User> = getRepository(User)
  secret: string | undefined

  constructor(token: string) {
    this.token = token
    this.secret = process.env.JWT_SECRET
  }

  async getUser(): Promise<AuthResponse> {
    if (this.secret) {
      let jwtPayload: string | object
      try {
        jwtPayload = jwt.verify(this.token, this.secret)
      } catch (error) {
        return { message: 'ERROR: Wrong token sent', user: undefined }
      }

      const user = await this.repository.findOne({
        where: { id: JSON.parse(JSON.stringify(jwtPayload)).userId },
        relations: ['buckets'],
      })

      if (user === undefined)
        return {
          message: "ERROR: User doesn't exists in database",
          user: undefined,
        }

      return { message: undefined, user: user }
    }
    return {
      message: 'ERROR: Missing secret in your .env file',
      user: undefined,
    }
  }
}
