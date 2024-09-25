const jwt = require("jsonwebtoken");
const { privkey } = require("../config/key");

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


// router.post("/test", authenticateToken, (req, res) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });
// OUTPUT IS IN middleware/jwt.js

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
