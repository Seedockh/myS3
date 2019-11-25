import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: true })
  nickname: string

  @Column('text', { nullable: true })
  email: string

  @Column('text', { nullable: true })
  password: string
}

export default User
