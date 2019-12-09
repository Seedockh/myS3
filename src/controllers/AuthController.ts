import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository, Repository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";
require('dotenv').config();

const jwt_secret: string | undefined = process.env.JWT_SECRET

class AuthController {
  static login = async (req: Request, res: Response) => {
    if (jwt_secret === undefined) throw "jwt_secret is undefined";
    
    // Check if nickname and password are set
    let { nickname, password } = req.body;
    if (!(nickname && password)) {
      res.status(400).send();
    }

    // Get user from database
    const userRepository: Repository<User> = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { nickname } });
    } catch (error) {
      return res.status(401).send();
    }
    
    // Check if encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send();
      return;
    }

    // Sign JWT, valid for 1 hour
    const token: string = jwt.sign(
      { userId: user.uuid, username: user.nickname },
      jwt_secret,
      { expiresIn: "1h" }
    );
    
    // Send the jwt in the response
    res.send(token);
  };
}
export default AuthController;