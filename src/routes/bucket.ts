import { Router } from 'express'
import BucketController from '../controllers/BucketController'
import { checkJwt } from '../middlewares/checkJwt'

const router = Router()

// Get all buckets
router.get('/getAll', [checkJwt], BucketController.getAllBuckets)

//Create a new bucket
router.post('/createNew', BucketController.createBucket)

//Edit one bucket
router.put('/edit/:id([0-9]+)', [checkJwt], BucketController.editBucket)

//Delete one bucket
router.delete('/delete/:uuid([0-9]+)', [checkJwt], BucketController.deleteBucket)

export default router
