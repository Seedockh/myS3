import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { User } from './entity/User'

interface UserInterface {
  id: number
  nickname: string
  email: string
  password: string
}

const app: express.Application = express()
const port = 1337

// Get environment folder for any OS
const envFolder: string =
  process.env.APPDATA ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Preferences'
    : process.env.HOME + '/.local/share')
// Set app data folder
const dataDir: string = envFolder.concat('\\myS3DATA')

// Used for post requests
app.use(bodyParser.json())

// Get request
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Get was called')
  console.log('Get was called')
})

// Post request
app.post('/', (req: express.Request, res: express.Response) => {
  res.send('Post was called')
  console.log('Post was called')
})

// Put request
app.put('/', (req: express.Request, res: express.Response) => {
  res.send('Put was called')
  console.log('Put was called')
})

// Delete request
app.delete('/', (req: express.Request, res: express.Response) => {
  res.send('Delete was called')
  console.log('Delete was called')
})

const createUser = (
  nickname: string,
  email: string,
  password: string,
): void => {
  createConnection()
    .then(async connection => {
      console.log('Inserting a new user into the database...')
      const user: UserInterface = new User()
      user.nickname = nickname
      user.email = email
      user.password = password
      await connection.manager.save(user)
      console.log('Saved a new user with id: ' + user.id)
      console.log('Loading users from the database...')
      const users = await connection.manager.find(User)
      console.log('Loaded users: ', users)
      console.log('Here you can setup and run express/koa/any other framework.')
    })
    .catch(error => console.log(error))
}

app.listen(port, () => {
  // Create data folder if not exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }
  console.log(`Server started on port ${port}`)
  // Create the default user
  createUser('Jack', 'jack.sparrow@gmail.com', 'Sparrow')
})
