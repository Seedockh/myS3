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

  static getUser = async (req: Request, res: Response): Promise<Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()
      if (!authUser.user) return res.status(400).send(authUser.message)

      return res.status(200).send({
        id: authUser.user.id,
        nickname: authUser.user.nickname,
        email: authUser.user.email,
      })
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

  // Get user buckets
  static getBuckets = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()
      if (!authUser.user) return res.status(400).send(authUser.message)

      return res.status(200).send({
        list: getEnvFolder.readFolder(`${authUser.user.id}`),
      })
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

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

  // Check Password
  static checkPassword = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()
      if (!authUser.user) return res.status(400).send(authUser.message)
      return res
        .status(200)
        .send(
          authUser.user.checkIfUnencryptedPasswordIsValid(req.body.password),
        )
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
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

      const { nickname, email, password } = req.body
      const user = new User()
      if (nickname) user.nickname = nickname
      if (email) user.email = email
      if (password) user.password = password
      user.hashPassword()

      userRepository.merge(authUser.user, user)
      userRepository.save(authUser.user).then(
        (result: User): Response => {
          return res.status(200).send(result)
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

      userRepository.delete(user.id).then(
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

  // Generate a mail to reset password
  static generatePwMail = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const userRepository: Repository<User> = getRepository(User)
    const user = await userRepository.findOne({
      where: { email: req.body.email },
    })
    if (user === undefined)
      return res
        .status(400)
        .send({ message: 'Sorry, this email address is unknown' })

    if (user !== undefined) {
      const newPass: string = Math.random()
        .toString(36)
        .substring(7)
      user.password = newPass
      user.hashPassword()

      userRepository.save(user).then(
        (): Response => {
          const { email } = req.body
          const to: string = email
          const subject = 'Efrei myS3'
          const message = `You requested a password reset. Your new password is: ${newPass}`
          const mail: Mail = new Mail(to, subject, message)
          mail.sendMail()
          return res.send({
            message: 'Request password mail was sent',
          })
        },
      )
    }
  }
}

export default UserController
