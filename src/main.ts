import express from 'express'
import { Server } from 'http'
import fs from 'fs'
import bodyParser from 'body-parser'
import 'reflect-metadata'
import helmet from 'helmet'
import cors from 'cors'
import { createConnection } from 'typeorm'
import routes from './routes'
import FileManager from './services/filemanager'

const port = 1337
// Create express application instance
export const app: express.Application = express()
export let server: Server

export const getEnvFolder = new FileManager(process.platform)

export const initializeConnection = async (
  connectionName = 'default',
): Promise<void | string> => {
  return await createConnection(connectionName)
    .then(() => {
      console.log('Successfully connected to database')
      // Enable cross-origin Requests
      app.use(cors())
      // Secure app by setting various HTTP headers
      app.use(helmet())
      // Used for post requests
      app.use(bodyParser.urlencoded({ extended: false }))
      // Use all routes from routes folder
      app.use('/', routes)

      server = app.listen(port, () => {
        getEnvFolder.init('myS3DATA')
        console.log(`Server started on port ${port}`)
      })
    })
    .catch(error => {
      return error
    })
}

initializeConnection()
