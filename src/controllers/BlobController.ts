import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import { getEnvFolder } from '../main'
import multer from 'multer'
import path from 'path'
import Authentifier from '../services/authentifier'
import User from '../entity/User'
import Bucket from '../entity/Bucket'
import Blob from '../entity/Blob'

class BlobController {
  static retrieveBlob = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return res.status(200).send({ message: 'Init' })
  }

  static getBlobInfos = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return res.status(200).send({ message: 'Init' })
  }

  static addBlob = async (req: Request, res: Response): Promise<Response> => {
    if (req.headers.authorization) {
      const userToken = req.headers.authorization.replace('Bearer ', '')
      const auth = new Authentifier(userToken)
      const authUser = await auth.getUser()

      if (authUser.user === undefined)
        return res.status(400).send(authUser.message)

      const bucketRepository: Repository<Bucket> = getRepository(Bucket)
      const bucket = await bucketRepository.findOne({
        where: { name: req.params.bucketName },
      })
      if (bucket === undefined) {
        return res
          .status(400)
          .send({ message: "Bucket doesn't exists in database" })
      }

      const user = authUser.user
      const storage = multer.diskStorage({
        destination: (req, file, callback) =>
          callback(
            null,
            `${getEnvFolder.defaultPath}/${user.id}/${bucket.name}/`,
          ),
        filename: (req, file, callback) =>
          callback(
            null,
            path.parse(file.originalname).name +
              '-' +
              Date.now() +
              path.extname(file.originalname),
          ),
      })

      // 'filename' is the name of our file input field in the HTML form
      const upload = multer({ storage: storage }).single('mys3-upload')

      return upload(
        req,
        res,
        async (err: string): Promise<Response> => {
          // req.file contains information of uploaded file
          if (err) return res.send(err)
          if (!req.file)
            return res.send({ message: 'Please select a file to upload' })

          const blobRepository: Repository<Blob> = getRepository(Blob)
          const { filename, destination, size } = req.file
          const blob = new Blob()
          blob.name = filename
          blob.path = destination
          blob.size = size
          blob.bucket = bucket.id
          return blobRepository
            .save(blob)
            .then(
              (result): Response => {
                return res.send(result)
              },
            )
            .catch(
              (error): Response => {
                return res.send(error)
              },
            )
        },
      )
    } else {
      return res.status(400).send({
        message: 'ERROR : Missing Bearer token in your Authorizations',
      })
    }
  }

  static duplicateBlob = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return res.status(200).send({ message: 'Init' })
  }

  static deleteBlob = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const blobRepository: Repository<Blob> = getRepository(Blob)
    const blob = await blobRepository.findOne({
      where: { id: req.params.id },
    })
    if (blob === undefined) {
      return res
        .status(400)
        .send({ message: "ERROR: Blob doesn't exists in database" })
    }
    return blobRepository.delete(req.params.id).then(
      (result): Response => {
        console.log(getEnvFolder.deleteFile(blob.name))
        return res.send(result)
      },
    )
  }
}

export default BlobController
