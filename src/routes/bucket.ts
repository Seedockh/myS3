import { Router } from 'express'
import BucketController from '../controllers/BucketController'
import { checkJwt } from '../middlewares/checkJwt'

const router = Router()

// Get all buckets
router.get('/getAll', [checkJwt], BucketController.getAllBuckets)

//Create a new bucket
router.post('/createNew', [checkJwt], BucketController.createBucket)

//Edit one bucket
/** @FIXME Need to remove param id to take token */
router.put('/edit/:id([0-9]+)', [checkJwt], BucketController.editBucket)

//Delete one bucket
/** @FIXME Need to remove param id to take token */
router.delete('/delete/:id([0-9]+)', [checkJwt], BucketController.deleteBucket)

export default router
