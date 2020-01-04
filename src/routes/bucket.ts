import { Router } from 'express'
import BucketController from '../controllers/BucketController'
import { checkJwt } from '../middlewares/checkJwt'

const router = Router()

// Get all buckets
router.get('/getAll', [checkJwt], BucketController.getAllBuckets)

// Get to know if a bucket exists
router.head('/exists/:name', [checkJwt], BucketController.bucketExists)

// List all files of a bucket
router.get('/listFiles/:name', [checkJwt], BucketController.listFiles)

//Create a new bucket
router.post('/createNew', [checkJwt], BucketController.createBucket)

//Edit one bucket
router.put('/edit/:name', [checkJwt], BucketController.editBucket)

//Delete one bucket
router.delete('/delete/:name', [checkJwt], BucketController.deleteBucket)

export default router
