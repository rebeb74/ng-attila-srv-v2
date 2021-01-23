const mongoose = require('mongoose');
const nodemailer = require('nodemailer')

module.exports.contact = async (req, res) => {
    console.log('req.body', req.body)
    /* Create nodemailer transporter using environment variables. */
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    /* Send the email */
    await transporter.sendMail({
        from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_ADDRESS}>`,
        to: 'bertrandpetit10@gmail.com',
        subject: 'Message client Attila',
        text: `${req.body.firstname} ${req.body.lastname} vous a contacté depuis Attila\n
        Email: ${req.body.email}\n
        Tel: ${req.body.phone}\n
        Sujet: ${req.body.subject}\n
        Message: ${req.body.message}`
    })

    return res.status(200).json({
        emailSent: true
    })
    /* Preview only available when sending through an Ethereal account */
    // console.log(`Message preview URL: ${nodemailer.getTestMessageUrl(info)}`)
};