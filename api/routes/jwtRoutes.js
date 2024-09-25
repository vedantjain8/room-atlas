// const express = require("express");
// const { getRefreshToken } = require("../controllers/jwtController");
// const { authenticateToken } = require("../functions/jwt");
// const { generateAccessToken } = require("../functions/jwt");
// const jwt = require("jsonwebtoken");
// const {privkey } = require("../config/key");

// const router = express.Router();

// router.post("/refresh", authenticateToken, async (req, res) => {
//   const userID = req.user.userID;
//   const refreshToken = await getRefreshToken(userID);

//   // Verify refresh token
//   jwt.verify(refreshToken, privkey, (err, user) => {
//     if (err) {
//       return res.sendStatus(403);
//     } // Forbidden
//     const accessToken = generateAccessToken({
//       userID: user.userID,
//     });
//     res.json({ accessToken });
//   });
// });

// module.exports =  router ;
