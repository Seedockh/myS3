import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import { getEnvFolder } from '../main'
import Authentifier from '../services/authentifier'
import Bucket from '../entity/Bucket'
import Blob from '../entity/Blob'

class BucketController {
  // Get all users
  static getAllBuckets = async (
    req: Request,
    res: Response,
  ): Promise<Response> =>
    res.status(200).json({ buckets: await getManager().find(Bucket) })

  static bucketExists = async (req: Request, res: Response): Promise<void> => {
    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    const bucket = await bucketRepository.findOne({
      where: { name: req.params.name },
    })
    if (bucket === undefined) {
      return res.status(400).end()
    } else {
      return res.status(200).end()
    }
  }

  static listFiles = async (req: Request, res: Response): Promise<Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()

      if (authUser.user === undefined)
        return res.status(400).send(authUser.message)

      const bucketRepository: Repository<Bucket> = getRepository(Bucket)
      const bucket = await bucketRepository.findOne({
        where: { name: req.params.name },
        relations: ['blobs'],
      })
      if (bucket === undefined) {
        return res
          .status(400)
          .send({ message: "Bucket doesn't exists in database" })
      }

      return res.send({
        files: getEnvFolder.readFolder(`${authUser.user.id}/${bucket.name}`),
        blobs: bucket.blobs,
      })
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

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

      if (authUser.user === undefined)
        return res.status(400).send(authUser.message)

      const bucket = new Bucket()
      bucket.name = name
      bucket.user = authUser.user
      bucketRepository
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
      if (authUser.user === undefined)
        return res.status(400).send(authUser.message)
      const user = authUser.user

      const bucketRepository: Repository<Bucket> = getRepository(Bucket)
      const bucket = await bucketRepository.findOne({
        where: { name: req.params.name },
        relations: ["blobs"],
      })
      if (bucket === undefined)
        return res
          .status(400)
          .send({ message: "Bucket doesn't exists in database" })

      const oldName = bucket.name
      bucketRepository.merge(bucket, req.body)
      return bucketRepository.save(bucket).then(
        (result): Response => {
          if (bucket.blobs.length > 0) {
            const blobRepository: Repository<Blob> = getRepository(Blob)
            bucket.blobs.map(blob => {
              const newPath = blob.path.replace(oldName, bucket.name)
              blobRepository.merge(blob, { path: newPath })
              return blobRepository.save(blob).then(blobResult => {
                // Rename folder with new bucket name
                getEnvFolder.renameFolder(
                  `${user.id}/${oldName}`,
                  `${user.id}/${bucket.name}`,
                )
                return res.send(result)
              })
            })
          }
        },
      )
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

  // Delete bucket
  static deleteBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()

      if (authUser.user === undefined)
        return res.status(400).send(authUser.message)

      const bucketRepository: Repository<Bucket> = getRepository(Bucket)
      const bucket = await bucketRepository.findOne({
        where: { name: req.params.name },
      })
      if (bucket === undefined) {
        return res
          .status(400)
          .send({ message: "ERROR: Bucket doesn't exists in database" })
      }

      const user = authUser.user
      return bucketRepository.delete(bucket.id).then(
        (result): Response => {
          getEnvFolder.deleteFolder(`${user.id}/${bucket.name}`)
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
