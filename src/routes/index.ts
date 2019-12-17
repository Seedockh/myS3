import { Router, Request, Response } from 'express'
import auth from './auth'
import user from './user'
import bucket from './bucket'
import blob from './blob'

const routes = Router()

// Get home route
routes.get(
  '/',
  async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      message: 'Welcome on mys3 homepage !',
    })
  },
)

routes.use('/auth', auth)
routes.use('/user', user)
routes.use('/bucket', bucket)
routes.use('/blob', blob)

export default routes
