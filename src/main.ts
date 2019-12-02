import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import 'reflect-metadata'
import { createConnection, getManager, Connection, Repository } from 'typeorm'
import User from './entity/User'

interface UserInterface {
  id: number
  nickname: string
  email: string
  password: string
}

const port = 1337
export const app: express.Application = express()
export let userRepository: Repository<User>

export const getUserList = async () => await getManager().find(User)

export const createUser = async (
  connection: Connection,
  nickname: string,
  email: string,
  password: string,
) => {
  const user: UserInterface = new User()
  user.nickname = nickname
  user.email = email
  user.password = password
  return await connection.manager.save(user).catch(error => {
    return error
  })
}

export const initializeConnection = async (): Promise<void | UserInterface> => {
  return await createConnection()
    .then(async connection => {
      console.log('Successfully connected to database')
      userRepository = await connection.getRepository(User)
      return
      /*
      // Create the default user if not exists
      console.log('Inserting default user in the database')
      return createUser(connection, 'Jack', 'jack.sparrow@gmail.com', 'Sparrow')*/
    })
    .catch(error => error)
}

// Get environment folder for any OS
export const envFolder: string =
  process.env.APPDATA ||
  (process.platform == 'darwin'
    ? process.env.HOME + '/Library/Preferences'
    : process.env.HOME + '/.local/share')
// Set app data folder
export const dataDir: string = envFolder.concat('\\myS3DATA')

// Used for post requests
app.use(bodyParser.urlencoded({ extended: false }))

export const server = app.listen(port, (): void => {
  // Create data folder if not exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
  }
  console.log(`Server started on port ${port}`)

  // Connect to database
  initializeConnection()
})

// Get home route
app.get(
  '/',
  async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      message: 'Welcome on mys3 homepage !',
    })
  },
)

// Get all users
app.get(
  '/users',
  async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      users: await getUserList(),
    })
  },
)

// Create user
app.post(
  '/user',
  async (req: Request, res: Response): Promise<void> => {
    const user: UserInterface[] = userRepository?.create(req.body)
    await userRepository
      ?.save(user)
      .then(
        (result): Response => {
          return res.send(result)
        },
      )
      .catch(error => {
        console.log('>>>>>>>> POST route')
        return error
      })
  },
)

// Edit user
app.put(
  '/user/:id',
  async (req: Request, res: Response): Promise<void | Response> => {
    const user: UserInterface | undefined = await userRepository.findOne(
      req.params.id,
    )
    if (user === undefined) {
      return res.status(400).send(`User doesn't exists in database`)
    }
    userRepository.merge(user, req.body)
    await userRepository.save(user).then(
      (result): Response => {
        return res.send(result)
      },
    )
  },
)

// Delete user
app.delete(
  '/user/:id',
  async (req: Request, res: Response): Promise<void> => {
    await userRepository.delete(req.params.id).then(
      (result): Response => {
        return res.send(result)
      },
    )
  },
)
