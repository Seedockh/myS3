import { Router, Request, Response } from 'express'
import auth from './auth'
import user from './user'
import bucket from './bucket'
import blob from './blob'
import * as jwt from 'jsonwebtoken'

const routes = Router()

routes.get('/', (req, res) => {
  res.send({ message: 'Welcome on mys3 homepage !' })
})
routes.post(
  '/checktoken',
  (req: Request, res: Response): Response => {
    const secret: any = process.env.JWT_SECRET
    const valid = jwt.verify(req.body.token, secret, (err: any) =>
      err ? false : true,
    )
    return res.send({ valid: valid })
  },
)
routes.use('/auth', auth)
routes.use('/user', user)
routes.use('/bucket', bucket)
routes.use('/blob', blob)

export default routes
