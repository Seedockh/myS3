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

//Create a new user
router.post('/createNew', UserController.createUser)

//Edit one user
router.put('/edit', [checkJwt, checkRole(['ADMIN'])], UserController.editUser)

//Delete one user
router.delete(
  '/delete',
  [checkJwt, checkRole(['ADMIN'])],
  UserController.deleteUser,
)

export default router