import { expect } from 'chai'
import Mail from '../../src/services/mail'

const mail = (): void => {
  /*it('SENDS email successfully to random address', async done => {
    const mailing = new Mail('johndoe@gmail.com', 'hello', 'this is a test')
    const mail = await mailing.sendMail()
    expect(mail.accepted[0]).equals('johndoe@gmail.com')
    done()
  })*/

  it('FAILS to send email to wrong address', async done => {
    const mailing = new Mail('fakeuser', 'hello', 'this will fails')
    const mail = await mailing.sendMail()
    expect(mail.code).equals('EENVELOPE')
    done()
  })
}

export default mail
