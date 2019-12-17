import { Router } from 'express'
import BlobController from '../controllers/BucketController'
import { checkJwt } from '../middlewares/checkJwt'

const router = Router()


export default router
