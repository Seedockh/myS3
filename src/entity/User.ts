import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import Bucket from './Bucket'

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

  @OneToMany(
    () => Bucket,
    bucket => bucket.user,
  )
  buckets: Bucket[]

  hashPassword(): string | object {
    if (!this.password)
      return { error: true, message: 'Password is not defined.' }
    return (this.password = bcrypt.hashSync(this.password, 8))
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
    return bcrypt.compareSync(unencryptedPassword, this.password)
  }
}

export default User
