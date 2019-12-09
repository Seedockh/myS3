import express from 'express'
import fs from 'fs'
import bodyParser from 'body-parser'
import 'reflect-metadata'
import helmet from 'helmet'
import cors from 'cors'
import { createConnection } from 'typeorm'
import routes from './routes'

const port = 1337
// Create express application instance
export const app: express.Application = express()
export let server: void

// Get environment folder for any OS
export const getEnvFolder = (platform: string, dirName: string): string => {
  let dataDir: string

  switch (platform) {
    case 'darwin':
      dataDir = `${process.env.HOME}/Library/Preferences/${dirName}`
      break
    case 'linux':
      dataDir = `${process.env.HOME}/${dirName}`
      break
    default:
      dataDir = `${process.env.HOME}/.local/share/${dirName}`
      break
  }

  // Create data folder if not exists
  if (!fs.existsSync(dataDir) && platform === process.platform) {
    fs.mkdirSync(dataDir)
  }

  return dataDir
}

createConnection()
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
      getEnvFolder(process.platform, 'myS3DATA')
      console.log(`Server started on port ${port}`)
    })
  })
  .catch(error => {
    return error
  })
