import { Router } from 'express'
import BucketController from '../controllers/BucketController'
import { checkJwt } from '../middlewares/checkJwt'

const router = Router()

// Get all buckets
router.get('/getAll', [checkJwt], BucketController.getAllBuckets)

// List all files of a bucket
router.get('/listFiles/:id([0-9]+)', [checkJwt], BucketController.listFiles)

//Create a new bucket
router.post('/createNew', [checkJwt], BucketController.createBucket)

//Edit one bucket
router.put('/edit/:id([0-9]+)', [checkJwt], BucketController.editBucket)

//Delete one bucket
router.delete('/delete/:id([0-9]+)', [checkJwt], BucketController.deleteBucket)

export default router
