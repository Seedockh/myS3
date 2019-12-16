import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
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
            const filemanager = new FileManager('~/myS3DATA')
            console.log(
              filemanager.createFolder(`/${result.user.id}/${result.name}/`),
            )
            //console.log(result)

            return res.send(result)
          },
        )
        .catch(error => {
          res.status(400).send(error)
        })
    } else {
      return res.status(400).send({message: 'ERROR : Missing Bearer token in your Authorizations'})
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
      if (!authUser.user) return res.status(400).send(authUser.message)

      const bucketRepository: Repository<Bucket> = getRepository(Bucket)
      const bucket = await bucketRepository.findOne({
        where: { id: req.params.id },
      })
      if (bucket === undefined) {
        return res
          .status(400)
          .send({ message: "Bucket doesn't exists in database" })
      }
      bucketRepository.merge(bucket, req.body)
      await bucketRepository.save(bucket).then(
        (result): Response => {
          return res.send(result)
        },
      )
    } else {
      return res
        .status(400)
        .send({
          message: 'ERROR : Missing Bearer token in your Authorizations',
        })
    }
  }

  // Delete bucket
  static deleteBucket = async (req: Request, res: Response): Promise<void> => {
    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    await bucketRepository.delete(req.params.id).then(
      (result): Response => {
        return res.send(result)
      },
    )
  }
}

export default BucketController
