import express, { Request, Response} from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import "reflect-metadata";
import { createConnection, getManager, Connection, Repository } from "typeorm";
import { User } from "./entity/User";

interface UserInterface {
  id: number;
  nickname: string;
  email: string;
  password: string;
}

let app: express.Application = express();
let port: number = 1337;
let userRepository: Repository<User>;

// Get environment folder for any OS
let envFolder: string = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
// Set app data folder
let dataDir: string = envFolder.concat("\\myS3DATA");

// Used for post requests
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(port, () => {
  // Create data folder if not exists
  if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
  }
  console.log(`Server started on port ${port}`)

  // Connect to database
  initializeConnection();
})

let initializeConnection = (): void => {
  createConnection().then(async connection => {
    console.log("Successfully connected to database")

    userRepository = connection.getRepository(User);

    // Create the default user if not exists
    if ((await getUserList()).length != 0 ? true : false) {
      return
    }
    console.log("Inserting default user in the database");
    createUser(connection, "Jack", "jack.sparrow@gmail.com", "Sparrow")
  }).catch(error => {
    console.log(error)
  });
}

let getUserList = async () => await getManager().find(User);

let createUser = async (connection: Connection, nickname: string, email: string, password: string) => {
  const user: UserInterface = new User();
  user.nickname = nickname;
  user.email = email;
  user.password = password;
  await connection.manager.save(user).catch(error => {
    console.log(error)
  });
}

// Get all users
app.get("/users", async (req: Request, res: Response) => {
  res.status(200).json({
    users: await getUserList()
  });
});

// Create user
app.post("/user", async (req: Request, res: Response) => {
  const user = userRepository.create(req.body);
  const results = await userRepository.save(user);
  res.send(results);
});

// Edit user
app.put("/user/:id", async (req: Request, res: Response) => {
  // We use any because typeorm doc said the return of findOne is Promise<Entity | undefined>
  const user: any = await userRepository.findOne(req.params.id);
  userRepository.merge(user, req.body);
  const results = await userRepository.save(user);
  res.send(results);
});

// Delete user
app.delete("/user/:id", async (req: Request, res: Response) => {
  const results = await userRepository.delete(req.params.id);
  res.send(results);
});