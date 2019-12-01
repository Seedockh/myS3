import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: false })
  nickname: string

  @Column('text', { nullable: false })
  email: string

  @Column('text', { nullable: false })
  password: string
}

export default User
