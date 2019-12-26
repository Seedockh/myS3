import express, { Router, Request, Response } from 'express'
import path from 'path'
import auth from './auth'
import user from './user'
import bucket from './bucket'
import blob from './blob'

const routes = Router()

routes.get('/', (req, res, next) => {
  res.send({ message: 'Welcome on mys3 homepage !' })
})
routes.use('/auth', auth)
routes.use('/user', user)
routes.use('/bucket', bucket)
routes.use('/blob', blob)

export default routes
