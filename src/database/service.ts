import { createConnection, getManager, Connection } from 'typeorm'
import User from '../entity/User'

export default class DatabaseService {
  public databaseConnect: Connection

  constructor () {
    const connection = createConnection().then( async connect => {
      this.databaseConnect = await connect;
    });
  }

  async refreshDatabase() {
    return await getManager().find(User);
  }
}
