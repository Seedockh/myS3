import { Request, Response } from 'express'
import { getRepository, Repository, getManager } from 'typeorm'
import { getEnvFolder } from '../main'
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

  static addBlob = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    return res.status(200).send({ message: 'Init' })
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
    return res.status(200).send({ message: 'Init' })
  }
}

export default BlobController
