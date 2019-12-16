import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import * as jwt from 'jsonwebtoken'
import Bucket from '../entity/Bucket'
import User from '../entity/User'

class BucketController {
  // Get all users
  static getAllBuckets = async (req: Request, res: Response): Promise<Response> =>
    res.status(200).json({ buckets: await getManager().find(Bucket) })

  // Create bucket
  static createBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    const userRepository: Repository<User> = getRepository(User)
    const { name } = req.body

    if (req.headers.authorization && process.env.JWT_SECRET) {
      const userToken = req.headers.authorization.replace('Bearer ', '')

      let jwtPayload
      jwt.verify(userToken, process.env.JWT_SECRET, (err, data) =>
        err
          ? res.status(403).send({ message: 'ERROR: Wrong token sent' })
          : (jwtPayload = data),
      )

      const bucket = new Bucket()
      const belongsToUser: User | undefined = await userRepository.findOne({
        where: { id: JSON.parse(JSON.stringify(jwtPayload)).userId },
      })
      if (belongsToUser === undefined) {
        return res
          .status(400)
          .send({ message: "User doesn't exists in database" })
      }
      bucket.name = name
      bucket.user = belongsToUser
      await bucketRepository
        .save(bucket)
        .then(
          (result): Response => {
            // ~/myS3DATA/$USER_UUID/$BUCKET_NAME/$BLOB_NAME

            //console.log(result)

            return res.send(result)
          },
        )
        .catch(error => {
          res.status(400).send(error)
        })
    } else {
      return res
        .status(400)
        .send({ message: 'Something went wrong with your JWt configuration.' })
    }
  }

  // Edit bucket
  static editBucket = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    if (req.body.userUuid) {
      const userRepository: Repository<User> = getRepository(User)
      const user: User | undefined = await userRepository.findOne({
        where: { id: req.body.userUuid },
      })
      if (user === undefined) {
        return res
          .status(400)
          .send({ message: "User doesn't exists in database" })
      }
    }

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
