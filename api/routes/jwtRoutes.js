const express = require("express");
const { authenticateToken } = require("../middleware/jwtMiddleware");
const { getRefreshToken } = require("../functions/jwt");
const jwt = require("jsonwebtoken");
const { privkey } = require("../config/key");

const router = express.Router();

router.post("/refresh", authenticateToken, async (req, res) => {
  const userID = req.user.userID;
  try {
    const refreshToken = await getRefreshToken(userID);

    // Verify refresh token
    jwt.verify(refreshToken, privkey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      } // Forbidden
      const accessToken = generateAccessToken({
        userID: user.userID,
      });
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    return res.sendStatus(403).json({ message: error });
  }
});

module.exports = router;
