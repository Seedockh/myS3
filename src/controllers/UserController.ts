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
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    return res.status(200).send({
      id: user.result.id,
      nickname: user.result.nickname,
      email: user.result.email,
    })
  }

  // Get user buckets
  static getBuckets = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    return res.status(200).send({
      list: getEnvFolder.readFolder(`${user.result.id}`),
    })
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

  // Edit user
  static editUser = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    const userRepository: Repository<User> = getRepository(User)
    userRepository.merge(user.result, req.body)
    userRepository.save(user.result).then(
      (result: User): Response => {
        return res.send(result)
      },
    )
  }

  // Delete user
  static deleteUser = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    const userRepository: Repository<User> = getRepository(User)
    userRepository.delete(user.result.id).then(
      (result): Response => {
        getEnvFolder.deleteFolder(`${user.result.id}`)
        return res.send(result)
      },
    )
  }
}

export default UserController
