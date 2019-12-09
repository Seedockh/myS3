import { Request, Response, NextFunction } from "express";
import { getRepository, Repository } from "typeorm";
import User from "../entity/User";

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Get the user ID from previous middleware
    const uuid: string = res.locals.jwtPayload.userId;

    // Get user role from the database
    const userRepository: Repository<User> = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(uuid);
    } catch (uuid) {
      return res.status(401).send();
    }

    // Check if array of authorized roles includes the user's role
    if (roles.indexOf(user.role) > -1) next();
    else res.status(401).send();
  };
};
