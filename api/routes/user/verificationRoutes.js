const express = require("express");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const validator = require("validator");
require("dotenv").config();

const router = express.Router();

// /verify/email
router.post("/email", async (req, res) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email))
    return res.status(400).json({ message: "Email is required" });

  const _redisEmail = await redisClient.get(email);
  if (_redisEmail) {
    const ttl = await redisClient.ttl(email);
    return res.status(400).json({
      message: `OTP already sent, wait for ${ttl} seconds before trying again `,
    });
  }
  const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit otp
  await redisClient.hSet("OTPqueue", email, otp);
  return res.status(200).json({ message: "OTP job has been queued" });
});

router.post("/email/check", async (req, res) => {
  const { email, otp } = req.body;

  if (!email) return res.status(400).json({ message: "Enter valid email" });

  if (!otp || !validator.isNumeric(otp) || otp.length != 6)
    return res.status(400).json({ message: "Enter valid OTP" });

  const cachedOTP = await redisClient.get(email);
  if (!cachedOTP) {
    return res.status(400).json({ message: "OTP expired" });
  }
  if (otp != cachedOTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await redisClient.del(email);
  await pool.query("UPDATE users SET email_verified = true WHERE email = $1", [
    email,
  ]);
  return res.status(200).json({ message: "OTP verified successfully" });
});

module.exports = router;
