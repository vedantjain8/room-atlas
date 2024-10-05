const express = require("express");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const {authenticateToken} = require("../../middleware/jwtMiddleware");

const router = express.Router();

router.get("/profile/", authenticateToken, async function (req, res) {
  const username = req.query.username;

  if (!username) {
    return res
      .status(400)
      .json({ message: "Username query parameter is required" });
  }

  // TODO: try cacth block
  try {
    const userProfileCache = await redisClient.hGet(username, profile);

    if (userProfileCache) {
      return res.status(200).json({ message: userProfileCache });
    }

    const profileResult = await pool.query(
      `SELECT 
    u.username,
    u.avatar,
    u.bio,
    u.city,
    u.state,
    p.preference_name
    FROM 
    users u
    JOIN 
    preference_user_link pul
    ON 
    u.user_id = pul.user_id
    JOIN prefence p
    on p.preference_id = pul.prefrence_id
    where username = $1
    `,
      [username]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = profileResult.rows[0];

    await redisClient.hSet(username, profile);
    await redisClient.expire(username, 3600);

    res.status(200).json({ message: profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile/listing", authenticateToken, async function (req, res) {
  const offset = parseInt(req.query.offset) || 0;
  const username = req.query.username;

  if (!username) {
    return res
      .status(400)
      .json({ message: "Username query parameter is required" });
  }

  try {
    const result = await pool.query(
      "SELECT property_id, property_title, property_desc, images, uploadedBy, uploadedOn, isAvailable, location, city, state, listingType FROM listing JOIN users on listing.uploadedBy = users.user_id WHERE users.username = $1 LIMIT 20 OFFSET $2",
      [username, offset]
    );
    return res.status(200).json({
      message: result.rows,
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
