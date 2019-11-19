import { createConnection, Connection } from 'typeorm'
import { User } from '../entity/User'

export default class DatabaseService {
  public database: Promise<Connection>

  constructor() {
    this.database = createConnection()
  }

  refresh() {
    this.database.then(async connection => {
      const users = await connection.getRepository(User)
    })
  }
}
