import { Request, Response, NextFunction } from 'express'
import { getRepository, Repository } from 'typeorm'
import User from '../entity/User'

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get the user ID from previous middleware
    const uuid: string = res.locals.jwtPayload.userId

    // Get user role from the database
    const userRepository: Repository<User> = getRepository(User)
    let user: User
    user = await userRepository.findOneOrFail({ where: { uuid: uuid } })

    // Check if array of authorized roles includes the user's role
    if (roles.indexOf(user.role) > -1) next()
    else res.status(401).send({ message: `ERROR: ${user.role} Users are not authorized for this route` })
  }
}
