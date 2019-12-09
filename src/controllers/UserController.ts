import { Request, Response } from "express";
import { getRepository, Repository, getManager } from "typeorm";
import { User } from "../entity/User";

class UserController {
    // Get all users
    static getAllUsers = async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json({
            users: await getManager().find(User)
        });
    };

    // Create user
    static createUser = async (req: Request, res: Response): Promise<void> => {
        const userRepository: Repository<User> = getRepository(User);
        let { nickname, email, password, role } = req.body;
        let user = new User();
        user.nickname = nickname;
        user.email = email;
        user.password = password;
        user.role = role;
        user.hashPassword();
        await userRepository.save(user).then((result): Response => {
            return res.send(result);
        } ); 
    };

    // Edit user
    static editUser = async (req: Request, res: Response): Promise<void | Response> => {
        const userRepository: Repository<User> = getRepository(User);
        const user: User | undefined = await userRepository.findOne(req.params.id);
        console.log(user)
        if (user === undefined) {
            return res.status(400).send("User doesn't exists in database")
        }
        userRepository.merge(user, req.body);
        await userRepository.save(user).then((result): Response => {
            return res.send(result);
        });
    };

    // Delete user
    static deleteUser = async (req: Request, res: Response): Promise<void> => {
        const userRepository: Repository<User> = getRepository(User);
        await userRepository.delete(req.params.id).then((result): Response => {
            return res.send(result);
        });
    };
};

export default UserController;