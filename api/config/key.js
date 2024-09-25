const fs = require("fs");

// const pubkey = fs.readFileSync("instance/public-key.pem", "utf-8");
const privkey = fs.readFileSync("instance/private-key.pem", "utf-8");

module.exports = { privkey };
