import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import { getEnvFolder } from '../main'
import multer from 'multer'
import path from 'path'
import Authentifier from '../services/authentifier'
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
    const storage = multer.diskStorage({
      destination: (req, file, callback) =>
        callback(null, getEnvFolder.defaultPath),
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
        return blobRepository
          .save(blob)
          .then((result): Response => res.send(result))
          .catch(error => res.send(error))
      },
    )
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
