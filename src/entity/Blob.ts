import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import Bucket from './Bucket'

@Entity()
class Blob {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text', { nullable: false })
  name: string

  @Column('text', { nullable: false })
  path: string

  @Column('int', { nullable: false })
  size: int8

  @ManyToOne(
    () => Bucket,
    bucket => bucket.blobs,
    { onDelete: 'CASCADE' },
  )
  bucket: Bucket
}

export default Blob
