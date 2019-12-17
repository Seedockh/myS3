import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import { getEnvFolder } from '../main'
import User from '../entity/User'
import Mail from '../services/mail'
import Authentifier from '../services/authentifier'

class UserController {
  // Get all users
  static getAllUsers = async (req: Request, res: Response): Promise<Response> =>
    res.status(200).json({ users: await getManager().find(User) })

  // Create user
  static createUser = async (req: Request, res: Response): Promise<void> => {
    const userRepository: Repository<User> = getRepository(User)
    const { nickname, email, password, role } = req.body
    const user = new User()
    user.nickname = nickname
    user.email = email
    user.password = password
    user.role = role
    user.hashPassword()
    await userRepository
      .save(user)
      .then(
        (result): Response => {
          // Create folder with user UUID
          getEnvFolder.createFolder(result.id)

          // Send mail
          const to: string = user.email
          const subject = 'Efrei myS3'
          const message = `Welcome ${user.nickname}! Your account is now ready to use, enjoy :)`

          const mail: Mail = new Mail(to, subject, message)
          mail.sendMail()
          return res.send(result)
        },
      )
      .catch(error => {
        res.status(400).send(error)
      })
  }

  // Edit user
  static editUser = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const userRepository: Repository<User> = getRepository(User)
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()
      if (!authUser.user) return res.status(400).send(authUser.message)

      userRepository.merge(authUser.user, req.body)
      await userRepository.save(authUser.user).then(
        (result: User): Response => {
          return res.send(result)
        },
      )
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

  // Delete user
  static deleteUser = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const userRepository: Repository<User> = getRepository(User)
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()
      if (!authUser.user) return res.status(400).send(authUser.message)
      const user = authUser.user

      await userRepository.delete(user.id).then(
        (result): Response => {
          getEnvFolder.deleteFolder(`${user.id}`)
          return res.send(result)
        },
      )
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }
}

export default UserController
