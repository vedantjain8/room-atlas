const express = require("express");
const transporter = require("../../config/mailer");
const redisClient = require("../../config/dbredis");
const validator = require("validator");
require("dotenv").config();

const router = express.Router();

// /verify/email
router.post("/email", async (req, res) => {
  // TODO: limit this to 20 requests per hour
  // or 2000 requests per day
  // this can be done using cron job
  // hourly cron job to create a new key that has the mail remaining count
  // implement a queue for sending emails
  // this route will add the otp mail to the queue
  // the cron job will send the otp mail

  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  let mailOptions = {
    from: process.env.EMAIL_MAIL,
    to: email,
    subject: "OTP for email verification",
    html: `Your OTP is <b>${otp}</b>`,
    // todo: add html template
  };

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
    await redisClient.set(email, otp, { EX: 600 });
    return res.status(200).json({ message: "OTP sent successfully" });
  });
  // return res.status(200).json({ message: "OTP sent successfully" });
});

router.post("/email/check", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ message: "Enter valid email or OTP to check" });
  }

  const cachedOTP = await redisClient.get(email);
  if (!cachedOTP) {
    return res.status(400).json({ message: "OTP expired" });
  }
  if (otp != cachedOTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await redisClient.del(email);
  // TODO: update in db for email verified
  return res.status(200).json({ message: "OTP verified successfully" });
});

module.exports = router;
