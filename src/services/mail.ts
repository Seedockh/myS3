import nodemailer from 'nodemailer'

export default class Mail {
  to: string
  subject: string
  message: string

  constructor(to: string, subject: string, message: string) {
    this.to = to
    this.subject = subject
    this.message = message
  }

  sendMail(): Promise<string> {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: this.to,
      subject: this.subject,
      html: this.message,
    }

    const transporter = nodemailer.createTransport({
      // DON'T FORGET TO ALLOW LESS SECURE APPS TO USE THIS SERVICE !
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    })

    return transporter
      .sendMail(mailOptions)
      .then(result => result)
      .catch(error => error)
  }
}
