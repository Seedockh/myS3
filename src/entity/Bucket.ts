import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import User from './User'
import Blob from './Blob'

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

  @OneToMany(
    () => Blob,
    blob => blob.bucket,
  )
  blobs: Blob[]
}

export default Bucket
