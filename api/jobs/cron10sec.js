var cron = require("node-cron");
const redisClient = require("../config/dbredis");
const transporter = require("../config/mailer");
const settings = require("../config/settings");
require("dotenv").config();

async function sendOTP() {
  // daily limit break

  const queue = await redisClient.hGetAll("OTPqueue");
  if (Object.keys(queue).length === 0 || queue == null) return;

  for (const otpobejct in queue) {
    const email = otpobejct;
    const otp = queue[otpobejct];

    let mailOptions = {
      from: process.env.EMAIL_MAIL,
      to: email,
      subject: "OTP for email verification",
      html: `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #333333; text-align: center;">Email Verification</h2>
    <p style="color: #555555; font-size: 16px;">
    Hello,
    </p>
                <p style="color: #555555; font-size: 16px;">
                  To verify your email address, please use the following OTP (One Time Password):
                  </p>
                  <p style="text-align: center; font-size: 24px; font-weight: bold; color: #1a73e8; margin: 20px 0;">
                  ${otp}
                  </p>
                  <p style="color: #555555; font-size: 16px;">
                  This OTP is valid for only 10 minutes. Please do not share this code with anyone.
                  </p>
                  <p style="color: #555555; font-size: 16px;">
                  If you didn’t request this, please ignore this email.
                  </p>
                  <p style="text-align: center; font-size: 14px; color: #aaaaaa;">
                  Thank you for using our service!
                  </p>
                  </div>
                  </body>
                  </html>`,
    };

    const emailSent = await redisClient.get("emailSent");
    if (emailSent >= settings.server.dailyMailLimit) {
      console.log("Daily mail limit break");
      return;
    }

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.error(error);
      }
      console.log("Email sent: " + info.response);
      await redisClient.incr("emailSent");
      await redisClient.hDel("OTPqueue", email);
      await redisClient.set(email, otp, { EX: 600 });
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

cron.schedule("*/10 * * * * *", async () => {
  // console.log('running a task every 10 seconds');
  sendOTP();
});
