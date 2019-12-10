import * as nodemailer from "nodemailer";

export default class Mail {
  to: string;
  subject: string;
  message: string;

  constructor (to: string, subject: string, message: string) {
    this.to = to;
    this.subject = subject;
    this.message = message;
  }

  sendMail() {

    const mailOptions = {
        from : process.env.MAIL_USER,
        to: this.to,
        subject: this.subject,
        html: this.message
    }

    const transporter = nodemailer.createTransport({
      // DON'T FORGET TO ALLOW LESS SECURE APPS TO USE THIS SERVICE !
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return error;
        } else {
            return "E-mail a été envoyé avec succès!";
        }
    });
  }
}