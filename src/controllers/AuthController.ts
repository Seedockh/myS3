import { Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import fs from 'fs'
import { getEnvFolder } from '../main'
import { getRepository, Repository } from 'typeorm'
import User from '../entity/User'

class AuthController {
  static login = async (
    req: Request,
    res: Response,
  ): Promise<object | undefined> => {
    if (process.env.JWT_SECRET === undefined)
      return res.status(400).send({ message: 'jwt_secret is undefined' })

    // Check if nickname and password are set
    const { nickname, password } = req.body
    if (!(nickname && password)) {
      return res
        .status(400)
        .send({ message: 'Login failed : missing credentials.' })
    }

    // Get user from database
    const userRepository: Repository<User> = getRepository(User)
    let user: User
    try {
      user = await userRepository.findOneOrFail({ where: { nickname } })
    } catch (error) {
      return res
        .status(401)
        .send({ message: 'Login failed : wrong credentials.' })
    }

    // Check if encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(402).send({ message: 'Login failed : wrong password.' })
    }

    // Sign JWT, valid for 1 hour
    const token: string = jwt.sign(
      { userId: user.id, username: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    )

    if (!fs.existsSync(`${getEnvFolder.defaultPath}/${user.id}`) ) {
      // Create folder with user UUID
      getEnvFolder.createFolder(user.id)
    }
    // Send the jwt in the response
    res.send({ token: token })
  }
}
export default AuthController
