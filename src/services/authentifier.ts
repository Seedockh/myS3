import { IncomingHttpHeaders } from 'http'
import * as jwt from 'jsonwebtoken'
import * as Types from '../../types'
import User from '../entity/User'
import Bucket from '../entity/Bucket'
import Blob from '../entity/Blob'
import { getRepository, Repository } from 'typeorm'

export default class Authentifier {
  token: string
  secret: string | undefined
  payload: any
  headers: IncomingHttpHeaders

  constructor(headers: IncomingHttpHeaders) {
    this.headers = headers
  }

  getToken(): Types.AuthResponse {
    if (!process.env.JWT_SECRET)
      return {
        message: 'ERROR: Missing secret in your .env file',
        result: undefined,
      }
    if (!this.headers.authorization)
      return {
        message: 'ERROR : Missing Bearer token in your Authorizations',
        result: undefined,
      }

    try {
      this.payload = jwt.verify(
        this.headers.authorization.replace('Bearer ', ''),
        process.env.JWT_SECRET
      )
    }
    catch (error) {
      return { message: 'ERROR: Wrong token sent', result: undefined }
    }

    return { message: undefined, result: this.headers.authorization.replace('Bearer ', '')}
  }

  async getUser(): Promise<Types.AuthResponse> {
    const userRepository: Repository<User> = getRepository(User)
    const { userId } = this.payload
    const user: User | undefined = await userRepository.findOne({
      where: { id: userId },
    })

    if (user === undefined)
      return {
        message: "ERROR: User does not exist in database",
        result: undefined,
      }

    return { message: undefined, result: user }
  }

  async getBucket(identifier: number|string): Promise<Types.AuthResponse> {
    const bucketRepository: Repository<Bucket> = getRepository(Bucket)
    let bucket: Types.RelBucket | undefined = undefined
    if (typeof identifier === 'number')
      bucket = await bucketRepository.findOne({
        where: { id: identifier },
        relations: ['blobs'],
      })
    else if (typeof identifier === 'string')
      bucket = await bucketRepository.findOne({
        where: { name: identifier },
      })
    if (bucket === undefined)
      return {
        message: "ERROR: Bucket does not exist in database",
        result: undefined
      }

    return { message: undefined, result: bucket }
  }

  async getBlob(id: string): Promise<Types.AuthResponse> {
    const blobRepository: Repository<Blob> = getRepository(Blob)
    const blob: Types.RelBlob | undefined = await blobRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['bucket'],
    })
    if (blob === undefined)
      return {
        message: "ERROR: Blob does not exist in database",
        result: undefined
      }

    return { message: undefined, result: blob}
  }
}
