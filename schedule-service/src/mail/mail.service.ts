import nodemailer from 'nodemailer';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendMail(to: string, subject: string, body: string) {
    await this.transporter.sendMail({
      from: '"Healthcare App" <no-reply@healthcare.com>',
      to,
      subject,
      text: body,
    });
  }
}
