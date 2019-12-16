import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import * as jwt from 'jsonwebtoken'
import User from '../entity/User'
import Mail from '../services/mail'

class UserController {
  // Get all users
  static getAllUsers = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return res.status(200).json({
      users: await getManager().find(User),
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
    if (req.headers.authorization && process.env.JWT_SECRET) {
      const userToken = req.headers.authorization.replace('Bearer ', '')

      let jwtPayload
      jwt.verify(userToken, process.env.JWT_SECRET, (err, data) =>
        err
          ? res.status(403).send({ message: 'ERROR: Wrong token sent' })
          : (jwtPayload = data),
      )

      const user: User | undefined = await userRepository.findOne({
        where: { id: JSON.parse(JSON.stringify(jwtPayload)).userId },
      })
      if (user === undefined) {
        return res
          .status(400)
          .send({ message: "User doesn't exists in database" })
      }
      userRepository.merge(user, req.body)
      await userRepository.save(user).then(
        (result): Response => {
          return res.send(result)
        },
      )
    } else {
      return res
        .status(400)
        .send({ message: 'Something went wrong with your JWt configuration.' })
    }
  }

  // Delete user
  static deleteUser = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const userRepository: Repository<User> = getRepository(User)
    if (req.headers.authorization && process.env.JWT_SECRET) {
      const userToken = req.headers.authorization.replace('Bearer ', '')

      let jwtPayload
      jwt.verify(userToken, process.env.JWT_SECRET, (err, data) =>
        err
          ? res.status(403).send({ message: 'ERROR: Wrong token sent' })
          : (jwtPayload = data),
      )

      const user: User | undefined = await userRepository.findOne({
        where: { id: JSON.parse(JSON.stringify(jwtPayload)).userId },
      })
      if (user === undefined) {
        return res
          .status(400)
          .send({ message: "User doesn't exists in database" })
      }

      await userRepository.delete(user.id).then(
        (result): Response => {
          return res.send(result)
        },
      )
    } else {
      return res
        .status(400)
        .send({ message: 'Something went wrong with your JWt configuration.' })
    }
  }
}

export default UserController
