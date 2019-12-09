import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";

const routes = Router();

// Get home route
routes.get(
  '/',
  async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      message: 'Welcome on mys3 homepage !',
    })
  },
)

routes.use("/auth", auth);
routes.use("/user", user);

export default routes;
