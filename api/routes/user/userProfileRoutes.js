const express = require("express");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const { authenticateToken } = require("../../middleware/jwtMiddleware");

const router = express.Router();

router.get("/profile/:username", authenticateToken, async function (req, res) {
  const username = req.params.username;

  if (!username) {
    return res.status(400).json({ message: "Username parameter is required" });
  }

  try {
    const userProfileCache = await redisClient.hGet(username, "profile");

    if (userProfileCache) {
      return res.status(200).json({ message: JSON.parse(userProfileCache) });
    }

    const profileResult = await pool.query(
      `SELECT 
        u.username,
        u.avatar,
        u.bio,
        u.city,
        u.state,
        STRING_AGG(p.preference, ', ') AS preferences
      FROM 
          users u
      LEFT JOIN 
          preference_user_link pul
          ON u.user_id = pul.user_id
      LEFT JOIN 
          preferences p
          ON p.preference_id = pul.preference_id
      WHERE 
          u.username = $1
      GROUP BY 
          u.username, u.avatar, u.bio, u.city, u.state
    `,
      [username]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = profileResult.rows[0];

    await redisClient.hSet(username, "profile", JSON.stringify(profile));
    await redisClient.expire(username, 3600);

    res.status(200).json({ message: profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile/:username/listing", authenticateToken, async function (req, res) {
  const offset = parseInt(req.query.offset) || 0;
  const username = req.params.username;

  if (!username) {
    return res
      .status(400)
      .json({ message: "Username query parameter is required" });
  }

  try {
    const result = await pool.query(
      "SELECT listing_id, listing_title, listing_desc, images, uploaded_by, uploaded_on, location, listing.city, listing.state FROM listing LEFT JOIN users on listing.uploaded_by = users.user_id WHERE users.username = $1 LIMIT 20 OFFSET $2",
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
