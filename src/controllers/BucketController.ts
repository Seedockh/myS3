import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import { getEnvFolder } from '../main'
import FileManager from '../services/filemanager'
import Authentifier from '../services/authentifier'
import Bucket from '../entity/Bucket'

class BucketController {
  // Get all users
  static getAllBuckets = async (
    req: Request,
    res: Response,
  ): Promise<Response> =>
    res.status(200).json({ buckets: await getManager().find(Bucket) })

  // Create bucket
  static createBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    const { name } = req.body

    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()
      if (!authUser.user) return res.status(400).send(authUser.message)

      const bucket = new Bucket()
      bucket.name = name
      bucket.user = authUser.user
      await bucketRepository
        .save(bucket)
        .then(
          (result): Response => {
            // ~/myS3DATA/$USER_UUID/$BUCKET_NAME/$BLOB_NAME
            // Create folder with bucket name
            getEnvFolder.createFolder(`${result.user.id}/${result.name}`)

            return res.send(result)
          },
        )
        .catch(error => {
          res.status(400).send(error)
        })
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

  // Edit bucket
  static editBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()

      const bucketRepository: Repository<Bucket> = getRepository(Bucket)
      const bucket = await bucketRepository.findOne({
        where: { id: req.params.id },
      })
      if (bucket === undefined) {
        return res
          .status(400)
          .send({ message: "Bucket doesn't exists in database" })
      }
      const oldName = bucket.name
      bucketRepository.merge(bucket, req.body)
      return await bucketRepository.save(bucket).then(
        (result): Response => {
          if (authUser.user === undefined)
            return res.status(400).send(authUser.message)
          // Rename folder with new bucket name
          getEnvFolder.renameFolder(
            `${authUser.user.id}/${oldName}`,
            `${authUser.user.id}/${bucket.name}`,
          )
          return res.send(result)
        },
      )
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

  // Delete bucket
  static deleteBucket = async (req: Request, res: Response): Promise<void|Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()

      if (authUser.user === undefined)
        return res.status(400).send(authUser.message)

      const bucketRepository: Repository<Bucket> = getRepository(Bucket)
      const bucket = await bucketRepository.findOne({
        where: { id: req.params.id },
      })
      if (bucket === undefined) {
        return res
          .status(400)
          .send({ message: "ERROR: Bucket doesn't exists in database" })
      }

      return await bucketRepository.delete(req.params.id).then(
        (result): Response => {
          if (authUser.user === undefined)
            return res.status(400).send(authUser.message)
          getEnvFolder.deleteFolder(`${authUser.user.id}/${bucket.name}`)
          return res.send(result)
        },
      )
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }
}

export default BucketController
