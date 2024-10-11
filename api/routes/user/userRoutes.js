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

router.get("/check", async (req, res) => {
  const username = req.query.username;
  if (!username || username == "") {
    return res.status(400);
  }
  return res.status(200).json(await redisCheckUsername(username));
});

router.post("/register", async (req, res) => {
  let {
    username,
    email,
    password,
    security_question,
    security_answer,
    phone,
    gender,
    dob,
    occupation,
    city,
    state,
    created_at,
    emailVerified,
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Enter a valid email" });
  }

  const isUsernameAvailable = await redisCheckUsername(username, res);
  if (isUsernameAvailable.message !== "Username is available") {
    return res.status(400).json(isUsernameAvailable);
  }

  if (!password || !validator.isLength(password, { min: 4, max: 255 })) {
    return res.status(400).json({ message: "Enter a valid password" });
  }

  if (!security_answer) {
    return res.status(400).json({ message: "Enter a valid answer" });
  }

  if (!phone || !validator.isMobilePhone(phone)) {
    return res.status(400).json({ message: "Enter a valid phone number" });
  }

  if (!created_at) {
    created_at = new Date();
  }

  try {
    const pass_hash = await hashString(password);
    const securityAns_hash = await hashString(security_answer);

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
      gender,
      occupation,
      city,
      state,
      verified_email
      ) VALUES ($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning userid`,
      [
        username,
        email,
        pass_hash,
        dob,
        security_question,
        securityAns_hash,
        phone,
        gender,
        occupation,
        city,
        state,
        emailVerified ?? false,
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
  let { loginIdentifier, identifier, password } = req.body;
  let query;

  if (!identifier) {
    return res.status(400).json({ message: "Username or email is required" });
  }

  const isValidUsername =
    loginIdentifier === "username" &&
    validator.isLength(identifier, { min: 4, max: 255 }) &&
    allowedCharactersRegex.test(identifier);

  const isValidEmail =
    loginIdentifier === "email" && validator.isEmail(identifier);

  if (!isValidUsername && !isValidEmail) {
    return res
      .status(400)
      .json({ message: `Enter a valid ${loginIdentifier}` });
  }

  if (!password || !validator.isLength(password, { min: 4, max: 255 })) {
    return res.status(400).json({ message: "Enter a valid password" });
  }

  query = `SELECT user_id, pass_hash from users where ${loginIdentifier}='${identifier}'`;
  try {
    const pass_hash_result = await pool.query(query);

    if (pass_hash_result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid username" });
    }

    const pass_hash = pass_hash_result.rows[0].pass_hash;
    const user_id = pass_hash_result.rows[0].user_id;

    const passwordCorrect = await checkString(password, pass_hash);

    if (!passwordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const refreshToken = generateRefreshToken(user_id);
    const accessToken = generateAccessToken(user_id);

    await pool.query(
      "INSERT INTO refresh_token(user_id, token) values ($1, $2)",
      [user_id, refreshToken]
    );

    return res
      .status(200)
      .json({ message: "Login successful", token: accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
