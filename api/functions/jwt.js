const jwt = require("jsonwebtoken");
const { privkey } = require("../config/key");
const pool = require("../config/db");

function generateAccessToken(userID) {
  return jwt.sign({ userID: userID }, privkey, {
    expiresIn: "3d",
    algorithm: "RS256",
  });
}

function generateRefreshToken(userID) {
  return jwt.sign({ userID: userID }, privkey, {
    algorithm: "RS256",
    expiresIn: "15d",
  });
}

async function getRefreshToken(userID) {
  try {
    const result = await pool.query(
      `SELECT token FROM refreshtoken WHERE userid = $1`,
      [userID]
    );
    const token = result.rows[0];
    if (!token) {throw new Error("Token not found"); };
    return token.token;
  } catch (err) {
    console.error(err);
    throw new Error("Token not found");
  }
}

// router.post("/test", authenticateToken, (req, res) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });
// OUTPUT IS IN middleware/jwt.js

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  getRefreshToken,
};
