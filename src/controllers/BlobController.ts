import { Request, Response } from 'express'
import { getRepository, Repository } from 'typeorm'
import { getEnvFolder } from '../main'
import * as Types from '../../types'
import multer from 'multer'
import path from 'path'
import Authentifier from '../services/authentifier'
import Bucket from '../entity/Bucket'
import Blob from '../entity/Blob'

class BlobController {
  static retrieveBlob = async (
    req: Request,
    res: Response,
  ): Promise<void | Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined) return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined) return res.status(400).send(user.message)

    const blob = await authentifier.getBlob(req.params.id)
    if (blob.result === undefined) return res.status(400).send(blob.message)

    const bucket = await authentifier.getBucket(blob.result.bucket.id)
    if (bucket.result === undefined) return res.status(400).send(bucket.message)

    const getBinary = getEnvFolder.downloadFile(
      `${user.result.id}/${bucket!.result!.name}/${blob.result.name}`,
    )
    if (getBinary.file === null)
      return res.status(400).send({ message: getBinary.message })

    return res.status(200).sendFile(getBinary.file)
  }

  static getBlobInfos = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined) return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined) return res.status(400).send(user.message)

    const blob = await authentifier.getBlob(req.params.id)
    if (blob.result === undefined) return res.status(400).send(blob.message)

    return res.status(200).send(blob)
  }

  static shareBlob = async (req: Request, res: Response): Promise<Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined) return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined) return res.status(400).send(user.message)

    const blob = await authentifier.getBlob(req.params.id)
    if (blob.result === undefined) return res.status(400).send(blob.message)

    const bucket = await authentifier.getBucket(blob.result.bucket.id)
    if (bucket.result === undefined) return res.status(400).send(bucket.message)

    const getSharedFile = getEnvFolder.shareFile(
      `${user.result.id}/${bucket!.result.name}/${blob.result.name}`,
    )

    return res.status(200).send(getSharedFile.file)
  }

  static getPublicBlob = (req: Request, res: Response): Response | void => {
    const publicLink = getEnvFolder.downloadPublicFile(req.params.name)
    if (publicLink.file === null)
      return res.status(400).send({ message: publicLink.message })

    return res.status(200).sendFile(publicLink.file)
  }

  static addBlob = async (req: Request, res: Response): Promise<Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined) return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined) return res.status(400).send(user.message)

    const bucket = await authentifier.getBucket(req.params.name)
    if (bucket.result === undefined) return res.status(400).send(bucket.message)

    const storage = multer.diskStorage({
      destination: (req, file, callback) =>
        callback(
          null,
          `${getEnvFolder.defaultPath}/${user.result.id}/${bucket.result.name}/`,
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
        if (err) return res.send({ message: `ERROR: ${err}` })

        if (req.file === undefined)
          return res.send({ message: 'Please select a file to upload' })

        const blobRepository: Repository<Blob> = getRepository(Blob)
        const { filename, destination, size } = req.file
        const blob = new Blob()
        blob.name = filename
        blob.path = destination
        blob.size = size
        blob.bucket = bucket.result
        return blobRepository.save(blob).then(
          (result): Response => {
            return res.send(result)
          },
        )
      },
    )
  }

  static duplicateBlob = async (
    req: Request,
    res: Response,
  ): Promise<Blob | Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined) return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined) return res.status(400).send(user.message)

    const blob = await authentifier.getBlob(req.params.id)
    if (blob.result === undefined) return res.status(400).send(blob.message)

    const bucket = await authentifier.getBucket(blob.result.bucket.id)
    if (bucket.result === undefined) return res.status(400).send(bucket.message)

    const copyName = getEnvFolder.duplicateFile(
      `${user.result.id}/${bucket.result.name}/${blob.result.name}`,
    )
    const copyBlob = new Blob()
    copyBlob.name = copyName
    copyBlob.path = blob.result.path
    copyBlob.size = blob.result.size
    copyBlob.bucket = blob.result.bucket
    const blobRepository: Repository<Blob> = getRepository(Blob)
    return blobRepository.save(copyBlob).then(
      (result): Response => {
        return res.send(result)
      },
    )
  }

  static deleteBlob = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const authentifier: Authentifier = new Authentifier(req.headers)
    const token = authentifier.getToken()
    if (token.result === undefined) return res.status(400).send(token.message)

    const user = await authentifier.getUser()
    if (user.result === undefined) return res.status(400).send(user.message)

    const blob = await authentifier.getBlob(req.params.id)
    if (blob.result === undefined) return res.status(400).send(blob.message)

    const bucket = await authentifier.getBucket(blob.result.bucket.id)
    if (bucket.result === undefined) return res.status(400).send(bucket.message)

    const blobRepository: Repository<Blob> = getRepository(Blob)
    return blobRepository.delete(req.params.id).then(
      (result): Response => {
        getEnvFolder.deleteFile(
          `${user.result.id}/${bucket.result.name}/${blob.result.name}`,
        )
        return res.send(result)
      },
    )
  }
}

export default BlobController
