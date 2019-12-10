import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
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
    await userRepository.save(user).then((result): Response => {
      // Send mail
      const to: string = user.email
      const subject = 'Efrei myS3'
      const message = `Welcome ${user.nickname}! Your account is now ready to use, enjoy :)`

      const mail: Mail = new Mail(to, subject, message)
      mail.sendMail()
      return res.send(result)
    }).catch(error => {
      res.status(400).send(error)
    })
  }

  // Edit user
  static editUser = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const userRepository: Repository<User> = getRepository(User)
    const user: User | undefined = await userRepository.findOne({
      where: { uuid: req.params.uuid },
    })
    if (user === undefined) {
      return res
        .status(400)
        .send({ message: "User doesn't exists in database" })
    }
    const userUpdated = new User()
    userUpdated.nickname = req.body.nickname
    userUpdated.email = req.body.email
    userUpdated.password = req.body.password
    userUpdated.role = req.body.role
    userUpdated.hashPassword()
    userRepository.merge(user, userUpdated)
    await userRepository.save(user).then(
      (result): Response => {
        return res.send(result)
      },
    )
  }

  // Delete user
  static deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userRepository: Repository<User> = getRepository(User)
    await userRepository.delete(req.params.uuid).then(
      (result): Response => {
        return res.send(result)
      },
    )
  }

  // Generate a mail to reset password
  static generatePwMail = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    req.body.password = Math.random().toString(36).substring(7);
    const newPass: string = req.body.password
    await UserController.editUser(req, res)
    const { email } = req.body
    const to: string = email
    const subject = 'Efrei myS3'
    const message = `You requested a password reset. Your new password is: ${newPass}`
    const mail: Mail = new Mail(to, subject, message)
    mail.sendMail()
  }
}

export default UserController
