import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import User from './User'

@Entity()
class Bucket {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: false })
  name: string

  @ManyToOne(
    () => User,
    user => user.buckets,
    { onDelete: 'CASCADE' },
  )
  user: User
}

export default Bucket
