import { Router } from 'express'
import UserController from '../controllers/UserController'
import { checkJwt } from '../middlewares/checkJwt'
import { checkRole } from '../middlewares/checkRole'

const router = Router()

// Get all users
router.get(
  '/getAll',
  [checkJwt, checkRole(['ADMIN'])],
  UserController.getAllUsers,
)

// Get one user
router.get('/get', [checkJwt], UserController.getUser)

// Get user buckets
router.get('/getBuckets', [checkJwt], UserController.getBuckets)

//Create a new user
router.post('/createNew', UserController.createUser)

//Edit one user
router.put('/edit', [checkJwt], UserController.editUser)

//Delete one user
router.delete(
  '/delete',
  [checkJwt, checkRole(['ADMIN'])],
  UserController.deleteUser,
)

// Change password
router.put('/generatePwMail/:uuid([0-9]+)', UserController.generatePwMail)

export default router
