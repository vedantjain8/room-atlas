const express = require("express");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const settings = require("../../config/settings");
const getUserData = require("../../functions/user");

const router = express.Router();

router.get("/:userID", async function (req, res) {
  const user_id = req.params.userID;

  if (!user_id) {
    return res.status(400).json({ message: "User ID parameter is required" });
  }

  try {
    const userProfileCache = await getUserData(user_id);
    return res.status(200).json({ message: userProfileCache });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile/:username", async function (req, res) {
  const username = req.params.username;

  if (!username) {
    return res.status(400).json({ message: "Username parameter is required" });
  }

  try {
    let user_id = await redisClient.hGet(`userLookup`, username);
    if (user_id) {
      const userProfileCache = await getUserData(user_id);
      return res.status(200).json({ message: userProfileCache });
    }

    const userResult = await pool.query(
      `select user_id from users where username = $1`,
      [username]
    );
    if (userResult.rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    user_id = userResult.rows[0].user_id;
    const userProfile = await getUserData(user_id);
    await redisClient.hSet(`userLookup`, username, user_id);
    await redisClient.expire(`userLookup`, settings.server.defaultCacheTimeout);

    return res.status(200).json({ message: userProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/profile/:username/listing",
  authenticateToken,
  async function (req, res) {
    try {
      const offset = parseInt(req.query.offset) || 0;
      const username = req.params.username;

      if (!username) {
        return res
          .status(400)
          .json({ message: "Username query parameter is required" });
      }

      let user_id =
        (await redisClient.hGet(`userLookup`, username)) ??
        pool.query("select user_id from users where username = $1", [username])
          .rows[0].user_id;

      if (!user_id)
        return res.status(404).json({ message: "Profile not found" });

      const result = await pool.query(
        `
        SELECT 
          listing.listing_id,
          listing.listing_title,
          listing.listing_desc,
          listing.images,
          listing.uploaded_by,
          listing.is_available,
          listing.rented_on,
          listing.area,
          listing.city,
          listing.state,
          lm.listing_type,
          lm.prefered_tenants,
          lm.is_available,
          lm.bedrooms,
          lm.bathrooms,
          lm.rent,
          lm.deposit,
          lm.furnishing,
          lm.floor,
          lm.total_floors,
          lm.areasqft,
          ARRAY_AGG(a.amenity_name) AS amenities
        FROM
          listing
        JOIN 
          listing_metadata lm
        ON 
          listing.listing_id = lm.listing_id
        LEFT JOIN 
          listing_amenities_link la
        ON 
          listing.listing_id = la.listing_id
        LEFT JOIN
          amenities a
        ON
          la.amenity_id = a.amenity_id 
        WHERE 
          listing.uploaded_by = $1
        GROUP BY 
            listing.listing_id,
            lm.listing_type,
            lm.prefered_tenants,
            lm.is_available,
            lm.bedrooms,
            lm.bathrooms,
            lm.rent,
            lm.deposit,
            lm.furnishing,
            lm.floor,
            lm.total_floors,
            lm.areasqft
        LIMIT ${settings.database.limit} offset $2`,
        [user_id, offset]
      );
      return res.status(200).json({
        message: result.rows,
      });
    } catch (error) {
      console.error("Error fetching listings:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
