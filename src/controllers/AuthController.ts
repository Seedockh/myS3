import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository, Repository } from "typeorm";
import { validate } from "class-validator";
import User from "../entity/User";

class AuthController {
  static login = async (req: Request, res: Response) => {
    if (process.env.JWT_SECRET === undefined) throw "jwt_secret is undefined";

    // Check if nickname and password are set
    let { nickname, password } = req.body;
    if (!(nickname && password)) {
      return res.status(400).send({ message: 'Login failed : missing credentials.'})
    }

    // Get user from database
    const userRepository: Repository<User> = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { nickname } });
    } catch (error) {
      return res.status(401).send({ message: 'Login failed : wrong credentials.'});
    }

    // Check if encrypted password match
    if (!user.checkIfUnencryptedPasswordIsValid(password)) {
      return res.status(402).send({ message: 'Login failed : wrong password.'});
    }

    // Sign JWT, valid for 1 hour
    const token: string = jwt.sign(
      { userId: user.uuid, username: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send the jwt in the response
    res.send({ token: token });
  };
}
export default AuthController;
