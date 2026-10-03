const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = ({ to, subject, html }) =>
  transporter.sendMail({
    from: `"ArtMart" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

module.exports = sendEmail;