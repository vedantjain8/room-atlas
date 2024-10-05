const jwt = require("jsonwebtoken");
const { privkey } = require("../config/key");

function authenticateToken(req, res, next) {
  // used as a middleware
  const token = req.headers["authorization"];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, privkey, (err, user) => {
    if (err) {
      console.error(err);
      return res.sendStatus(401);
    }
    req.user = user;

    next();
  });
}



// {
//   "message": "This is a protected route",
//   "user": {
//       "userID": "1",
//       "iat": 1723571023,
//       "exp": 1723614223
//   }
// }
module.exports = { authenticateToken };


