import User from './src/entity/User'
import Bucket from './src/entity/Bucket'
import Blob from './src/entity/Blob'

export as namespace Types

export interface RelBucket extends Bucket {
  blobs: Blob[]
}

export interface RelBlob extends Blob {
  bucket: Bucket
}

export interface AuthResponse {
  message: string | undefined
  result: any
}
