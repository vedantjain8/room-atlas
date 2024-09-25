const bcrypt = require('bcrypt');

async function hashString(inputString) {
  try {
    var salt = bcrypt.genSaltSync(10);
    var password_hash = bcrypt.hashSync(inputString, salt);
    return password_hash;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function checkString(inputString, hash) {
  try {
    let loginSuccessBool = bcrypt.compareSync(inputString, hash);
    return loginSuccessBool;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { hashString, checkString };
