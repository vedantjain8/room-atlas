const pool = require("../config/db");
const redisClient = require("../config/dbredis");
const settings = require("../config/settings");

async function getUserData(user_idArgs, reload = false) {
  // user_id is string
  const user_id = user_idArgs.toString();
  try {
    if (reload == false) {
      const value = await redisClient.hGet("userData", user_id);
      if (value) {
        return JSON.parse(value);
      }
    }
    const userResult = await pool.query(
      `SELECT 
        users.user_id, 
        users.username, 
        users.email, 
        users.bio, 
        users.avatar, 
        users.created_at, 
        users.active, 
        users.user_role, 
        users.gender, 
        users.occupation, 
        users.city, 
        users.state, 
        users.email_verified,
        STRING_AGG(p.preference, ', ') AS preferences
      from 
        users
      LEFT JOIN 
        preference_user_link pul
        ON users.user_id = pul.user_id
      LEFT JOIN 
        preferences p
        ON p.preference_id = pul.preference_id
      where 
        users.user_id = $1
      GROUP BY 
        users.user_id, users.username, users.avatar, users.bio, users.city, users.state
        `,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return new Error("User not found");
    }

    var userData = userResult.rows[0];

    await redisClient.hSet("userData", user_id, JSON.stringify(userData));
    await redisClient.hExpire(
      "userData",
      user_id,
      settings.server.defaultCacheTimeout
    );
    // await redisClient.set(`userData:${user_id}`, JSON.stringify(userData));
    // await redisClient.expire(`userData:${user_id}`, settings.server.defaultCacheTimeout);

    return userData;
  } catch (err) {
    return err;
  }
}

module.exports = getUserData;
