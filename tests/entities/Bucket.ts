import { expect } from 'chai'
import { bucketRepository } from '../main.test'
import Bucket from '../../src/entity/Bucket'

const bucketEntity = (): void => {
  it('INSTANTIATES correctly a new Bucket model', done => {
    const bucket = new Bucket()
    expect(JSON.stringify(bucket)).equals(JSON.stringify({
      id: undefined,
      name: undefined,
      userUuid: undefined
    }))
    done()
  })

  it('FAILS to create a bucket with wrong setup', async done => {
    let bucket = new Bucket()
    bucket.name = null
    bucketRepository.save(bucket).then().catch(error => {
      expect(error.message).contains('not-null constraint')
      done()
    })
  })

  it('CREATES and DELETES one Bucket successfully', done => {
    let bucket = new Bucket()
    bucket.name = 'First bucket'
    bucketRepository.save(bucket).then( dbBucket => {
      expect(typeof dbBucket.id).equals('number')
      expect(typeof dbBucket.name).equals('string')

      bucketRepository.delete(2).then(result => {
        expect(JSON.stringify(result)).equals(JSON.stringify({ raw:[],  affected: 1 }))
        done()
      })
    })
  })
}

export default bucketEntity
