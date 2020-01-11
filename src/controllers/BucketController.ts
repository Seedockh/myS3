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

  static bucketExists = async (req: Request, res: Response): Promise<Response|void> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    const bucket = await authentifier.getBucket(req.params.name)
    if (bucket.result === undefined)
      return res.status(400).end()
    return res.status(200).end()
  }

  static listFiles = async (req: Request, res: Response): Promise<Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    const bucket = await authentifier.getBucket(req.params.name)
    if (bucket.result === undefined)
      return res.status(400).send(bucket.message)

    return res.status(200).send({
      files: getEnvFolder.readFolder(`${user.result.id}/${bucket.result.name}`),
      blobs: bucket.result.blobs,
    })
  }

  // Create bucket
  static createBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    const bucket = new Bucket()
    const { name } = req.body
    bucket.name = name
    bucket.user = user.result
    bucketRepository
      .save(bucket)
      .then(
        (result): Response => {
          // ~/myS3DATA/$USER_UUID/$BUCKET_NAME/$BLOB_NAME
          // Create folder with bucket name
          getEnvFolder.createFolder(`${result.user.id}/${result.name}`)

          return res.status(200).send(result)
        },
      )
      .catch(error => {
        res.status(400).send(error)
      })
  }

  // Edit bucket
  static editBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    const bucket = await authentifier.getBucket(req.params.name)
    if (bucket.result === undefined)
      return res.status(400).send(bucket.message)

    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    const oldName = bucket.result.name
    bucketRepository.merge(bucket.result, req.body)
    return bucketRepository.save(bucket.result).then(
      async (result): Promise<Response> => {
        if (bucket.result.blobs.length > 0) {
          const blobRepository: Repository<Blob> = getRepository(Blob)
          await bucket.result.blobs.map(async (blob: Blob) => {
            const newPath = blob.path.replace(oldName, bucket.result.name)
            blobRepository.merge(blob, { path: newPath })
            return await blobRepository.save(blob)
          })
        }
        // Rename folder with new bucket name
        getEnvFolder.renameFolder(
          `${user.result.id}/${oldName}`,
          `${user.result.id}/${bucket.result.name}`,
        )
        return res.send(result)
      },
    )
  }

  // Delete bucket
  static deleteBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined)
      return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined)
      return res.status(400).send(user.message)

    const bucket = await authentifier.getBucket(req.params.name)
    if (bucket.result === undefined)
      return res.status(400).send(bucket.message)

    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    return bucketRepository.delete(bucket.result.id).then(
      (result): Response => {
        getEnvFolder.deleteFolder(`${user.result.id}/${bucket.result.name}`)
        return res.send(result)
      },
    )
  }
}

export default BucketController
