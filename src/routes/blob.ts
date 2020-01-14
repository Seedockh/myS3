import { Router } from 'express'
import BlobController from '../controllers/BlobController'
import { checkJwt } from '../middlewares/checkJwt'

const router = Router()

// Retrieve a blob
router.get('/retrieve/:id([0-9]+)', [checkJwt], BlobController.retrieveBlob)

// Get blob metadatas infos
router.get('/getinfos/:id([0-9]+)', [checkJwt], BlobController.getBlobInfos)

// Share a blob to the assets
router.get('/share/:id([0-9]+)', [checkJwt], BlobController.shareBlob)

// Get a public blob
router.get('/public/:name', BlobController.getPublicBlob)

// Get a private blob
router.get('/private/:name', BlobController.getPrivateBlob)

// Add a blob
router.post('/add/:bucketName', [checkJwt], BlobController.addBlob)

// Duplicate a blob
router.post('/duplicate/:id([0-9]+)', [checkJwt], BlobController.duplicateBlob)

// Delete a blob
router.delete('/delete/:id([0-9]+)', [checkJwt], BlobController.deleteBlob)

export default router
