import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import * as bcrypt from 'bcryptjs'

@Entity()
class User {
  @PrimaryGeneratedColumn()
  uuid: number

  @Column('text', { nullable: false })
  nickname: string

  @Column('text', { nullable: false })
  email: string

  @Column('text', { nullable: false })
  password: string

  @Column('text', { nullable: true })
  role: string

  hashPassword() {
    if (!this.password)
      return { error: true, message: 'Password is not defined.' }
    return (this.password = bcrypt.hashSync(this.password, 8))
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password)
  }
}

export default User
