import { Router } from 'express'
import BlobController from '../controllers/BlobController'
import { checkJwt } from '../middlewares/checkJwt'

const router = Router()

// Retrieve a blob
router.get('/retrieve/:id([0-9]+)', [checkJwt], BlobController.retrieveBlob)

// Get blob metadatas infos
router.get('/getinfos/:id([0-9]+)', [checkJwt], BlobController.getBlobInfos)

// Add a blob
router.post('/add', [checkJwt], BlobController.addBlob)

// Duplicate a blob
router.post('/duplicate/:id([0-9]+)', [checkJwt], BlobController.duplicateBlob)

// Delete a blob
router.delete('/delete/:id([0-9]+)', [checkJwt], BlobController.deleteBlob)

export default router
