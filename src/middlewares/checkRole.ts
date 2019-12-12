import { Request, Response, NextFunction } from 'express'
import { getRepository, Repository } from 'typeorm'
import User from '../entity/User'

export const checkRole = (roles: Array<string>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    // Get the user ID from previous middleware
    const id: string = res.locals.jwtPayload.userId

    // Get user role from the database
    const userRepository: Repository<User> = getRepository(User)
    const user: User = await userRepository.findOneOrFail({
      where: { id: id },
    })

    // Check if array of authorized roles includes the user's role
    if (roles.indexOf(user.role) > -1) next()
    else
      res.status(401).send({
        message: `ERROR: ${user.role} Users are not authorized for this route`,
      })
  }
}
