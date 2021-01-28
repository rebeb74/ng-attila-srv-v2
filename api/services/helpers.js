const nodemailer = require('nodemailer');

module.exports = {
  sendEmail: async ({ to, subject, text }) => {
    /* Create nodemailer transporter using environment variables. */
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    /* Send the email */
    await transporter.sendMail({
      from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_ADDRESS}>`,
      to,
      subject,
      text
    });
  }
};
