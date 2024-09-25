const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
  pool: true,
  service: "gmail",
  auth: {
    user: process.env.EMAIL_MAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

module.exports = transporter;
