import { expect } from 'chai'
import DatabaseService from '../src/database/service'

const database = new DatabaseService();

describe(':: init test', (): void => {
  const users = database.refresh();
  console.log(database);
  console.log(users);
  //  console.log('------ USERS LIST --------')
  //  console.log(res);

  it('makes a first init test', () => {
    expect(1+2+3).equal(6)
  })
})