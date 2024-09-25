const express = require("express");
const validator = require("validator");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const { hashString, checkString } = require("../../functions/hashPassword");
const {
  generateRefreshToken,
  generateAccessToken,
} = require("../../functions/jwt");

const router = express.Router();

const allowedCharactersRegex = /^[a-zA-Z0-9_]*$/;

async function redisCheckUsername(username) {
  if (
    !username ||
    !validator.isLength(username, { min: 4, max: 255 }) ||
    !allowedCharactersRegex.test(username)
  ) {
    return { message: "Enter a valid username" };
  }

  try {
    const redisResult = await redisClient.sIsMember("usernames", username);
    if (redisResult) {
      return { message: "Username already exists" };
    }

    const postgresResult = await pool.query(
      "SELECT EXISTS (SELECT * FROM users WHERE username = $1)",
      [username]
    );
    if (postgresResult.rows[0].exists) {
      await redisClient.sAdd("usernames", username);
      await redisClient.expire("usernames", 60 * 60 * 4);
      return { message: "Username already exists" };
    }

    return { message: "Username is available" };
  } catch (err) {
    console.error(err);
    return { message: "Internal server error" };
  }
}

router.post("/check", (req, res) => {
  const { username } = req.body;
  redisCheckUsername(username, res);
});

router.post("/register", async (req, res) => {
  let {
    username,
    email,
    password,
    question,
    answer,
    phone,
    gender,
    avatar,
    dob,
    occupation,
    city,
    state,
    created_at,
    preferences,
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Enter a valid email" });
  }

  const isUsernameAvailable = await redisCheckUsername(username, res);
  if (isUsernameAvailable.message !== "Username is available") {
    return res.status(400).json(isUsernameAvailable);
  }

  // implement redis username check

  if (!password || !validator.isLength(password, { min: 4, max: 255 })) {
    return res.status(400).json({ message: "Enter a valid password" });
  }

  if (!answer || !validator.isLength(answer, { min: 4, max: 255 })) {
    return res.status(400).json({ message: "Enter a valid answer" });
  }

  if (!phone || !validator.isMobilePhone(phone)) {
    return res.status(400).json({ message: "Enter a valid phone number" });
  }

  if (!avatar || !validator.isURL(avatar)) {
    avatar = "/assets/profile/default_user_profile.png";
  }

  if (!created_at) {
    created_at = new Date();
  }

  try {
    const pass_hash = await hashString(password);
    const securityAns_hash = await hashString(answer);

    const refreshToken = generateRefreshToken(username);
    const accessToken = generateAccessToken(username);

    const userData = await pool.query(
      `INSERT INTO users(
      username,
      email,
      pass_hash,
      dob,
      question,
      answer_hash,
      phone,
      avatar,
      gender,
      occupation,
      city,
      state,
      preference
      ) VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning userid`,
      [
        username,
        email,
        pass_hash,
        dob,
        question,
        securityAns_hash,
        phone,
        "default",
        gender,
        occupation,
        city,
        state,
        preferences,
      ]
    );

    const userID = userData.rows[0].userid;

    await pool.query(
      "INSERT INTO refresh_token(userid, token) values ($1, $2)",
      [userID, refreshToken]
    );
    return res.status(200).json({
      message: "user account created successfully",
      token: accessToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  let { username, email, password } = req.body;
  let query;
  // username or email, query builder use query from variable

  if (
    (!username ||
      !validator.isLength(username, { min: 4, max: 255 }) ||
      !allowedCharactersRegex.test(username)) &&
    (!email || !validator.isEmail(email))
  ) {
    return res.status(400).json({ message: "Enter a valid username or email" });
  }

  if (email) {
    query = `SELECT pass_hash from users where email='${email}'`;
  }

  if (username) {
    query = `SELECT pass_hash from users where username='${username}'`;
  }

  if (!password || !validator.isLength(password, { min: 4, max: 255 })) {
    return res.status(400).json({ message: "Enter a valid password" });
  }

  const pass_hash_result = await pool.query(
    query
  );
  
  if (pass_hash_result.rows.length === 0) {
    return res.status(400).json({ message: "Invalid username" });
  }

  const pass_hash = pass_hash_result.rows[0].pass_hash;

  const passwordCorrect = await checkString(password, pass_hash);

  if (!passwordCorrect) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const refreshToken = generateRefreshToken(username);

  return res
    .status(200)
    .json({ message: "Login successful", token: refreshToken });
});

module.exports = router;
