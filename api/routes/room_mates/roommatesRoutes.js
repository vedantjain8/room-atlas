const express = require("express");
const pool = require("../../config/db");
const redisClient = require("../../config/dbredis");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const settings = require("../../config/settings");
const getUserData = require("../../functions/user");
const {
  incrementViewCount,
  incrementLikeCount,
  incrementShareCount,
  getViewCount,
  getLikeCount,
  getShareCount,
  setViewCount,
  setLikeCount,
  setShareCount,
} = require("../../functions/stats");

const router = express.Router();

router.get("/", async (req, res) => {
  const offset = Number(req.query.offset) || 0;
  const roommates_needed = req.query.roommates_needed
    ? req.query.roommates_needed.split(",")
    : [];
  const max_roommates = req.query.max_roommates
    ? req.query.max_roommates.split(",")
    : [];
  const bhk = req.query.bhk ? req.query.bhk.split(",").map(Number) : [];
  const rentMin = Number(req.query.rentMin) || 0;
  const rentMax = Number(req.query.rentMax) || 999999;
  const depositMin = Number(req.query.depositMin) || 0;
  const depositMax = Number(req.query.depositMax) || 999999;
  const accommodation_type = req.query.accommodation_type
    ? req.query.accommodation_type.split(",").map(Number)
    : [];
  const bathrooms = req.query.bathrooms
    ? req.query.bathrooms.split(",").map(Number)
    : [];
  const type = req.query.type ? req.query.type.split(",").map(Number) : [];
  const tenants = req.query.tenants
    ? req.query.tenants.split(",").map(Number)
    : [];
  const furnishing = req.query.furnishing
    ? req.query.furnishing.split(",").map(Number)
    : [];
  const amenities = req.query.amenities
    ? req.query.amenities.split(",").map(Number)
    : [];
  const preferences = req.query.preferences
    ? req.query.preferences.split(",")
    : [];

  let filters = [];
  let values = [offset];
  let idx = 2;

  // Add filters dynamically
  if (bhk.length > 0) {
    filters.push(`rlm.bedrooms IN (${bhk.map(() => `$${idx++}`).join(",")})`);
    values.push(...bhk);
  }
  if (roommates_needed.length > 0) {
    filters.push(
      `rlm.roommates_needed IN (${roommates_needed
        .map(() => `$${idx++}`)
        .join(",")})`
    );
    values.push(...roommates_needed);
  }
  if (max_roommates.length > 0) {
    filters.push(
      `rlm.max_roommates IN (${max_roommates.map(() => `$${idx++}`).join(",")})`
    );
    values.push(...max_roommates);
  }
  if (rentMin !== undefined && rentMax !== undefined) {
    filters.push(`rlm.rent BETWEEN $${idx++} AND $${idx++}`);
    values.push(rentMin, rentMax);
  }
  if (depositMin !== undefined && depositMax !== undefined) {
    filters.push(`rlm.deposit BETWEEN $${idx++} AND $${idx++}`);
    values.push(depositMin, depositMax);
  }

  if (bathrooms.length > 0) {
    filters.push(
      `rlm.bathrooms IN (${bathrooms.map(() => `$${idx++}`).join(",")})`
    );
    values.push(...bathrooms);
  }
  if (type.length > 0) {
    filters.push(
      `rlm.listing_type IN (${type.map(() => `$${idx++}`).join(",")})`
    );
    values.push(...type);
  }
  if (furnishing.length > 0) {
    filters.push(
      `rlm.furnishing IN (${furnishing.map(() => `$${idx++}`).join(",")})`
    );
    values.push(...furnishing);
  }
  if (amenities.length > 0) {
    filters.push(
      `a.amenity_id IN (${amenities.map(() => `$${idx++}`).join(",")})`
    );
    values.push(...amenities);
  }
  if (preferences.length) {
    filters.push(
      `pl.preference_id IN (${preferences.map(() => `$${idx++}`).join(",")})`
    );
    values.push(preferences.map(Number));
  }

  filters.push(`listing.accommodation_type IN (99)`);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const filter_hash = require("crypto")
    .createHash("md5")
    .update(whereClause)
    .digest("hex");

  // Check if the data is cached in Redis
  let data = await redisClient.hGet(
    "listings",
    `roomate-listings-${offset}-${
      offset + settings.database.limit
    }-${filter_hash}`
  );
  if (data) {
    return res
      .status(200)
      .json({ message: "roommate listing", data: JSON.parse(data) });
  }

  const query = `
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
      rlm.listing_type,
      rlm.is_available,
      rlm.bedrooms,
      rlm.bathrooms,
      rlm.rent,
      rlm.deposit,
      rlm.furnishing,
      rlm.floor,
      rlm.total_floors,
      rlm.areasqft,
      ARRAY_AGG(a.amenity_name) AS amenities
    FROM
      listing
    JOIN 
      roommate_listing_metadata rlm
    ON 
      listing.listing_id = rlm.listing_id
    LEFT JOIN 
      listing_amenities la
    ON 
      listing.listing_id = la.listing_id
    LEFT JOIN
      amenities a
    ON
      la.amenity_id = a.amenity_id 
    ${whereClause}
    GROUP BY 
      listing.listing_id,
      rlm.listing_type,
      rlm.is_available,
      rlm.bedrooms,
      rlm.bathrooms,
      rlm.rent,
      rlm.deposit,
      rlm.furnishing,
      rlm.floor,
      rlm.total_floors,
      rlm.areasqft
    ORDER BY listing.listing_id DESC
    LIMIT ${settings.database.limit} 
    OFFSET $1
  `;

  try {
    const result = await pool.query(query, values);

    // Cache the results in Redis
    await redisClient.hSet(
      "listings",
      `roommate-listings-${offset}-${
        offset + settings.database.limit
      }-${filter_hash}`,
      JSON.stringify(result.rows)
    );
    await redisClient.hExpire(
      "listings",
      `roommate-listings-${offset}-${
        offset + settings.database.limit
      }-${filter_hash}`,
      settings.server.defaultCacheTimeout
    );

    return res
      .status(200)
      .json({ message: "roommate Listing", data: result.rows });
  } catch (error) {
    console.error("Error executing query:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/create", authenticateToken, async (req, res) => {
  const userdata = await getUserData(req.user.userID);
  if (userdata.email_verified === false)
    return res.status(400).json({ message: "Email not verified" });

  let {
    // accommodation_type, use 99
    listing_title,
    listing_desc = null,
    image_json,
    uploaded_on,
    area,
    city,
    state,
    preference_list = [], //TODO: sort the order of the list
    amenities_list = [],
    listing_type, // Appartment, villa, bungalow i.e. 0,1,2
    prefered_tenants, // Family, bachelor, students
    is_available,
    bedrooms,
    bathrooms,
    rent,
    deposit,
    furnishing,
    floor_no,
    total_floors,
    areasqft,
    roommates_needed,
    max_roommates,
    lease_duration,
  } = req.body;

  if (!accommodation_type)
    return res
      .status(400)
      .json({ message: "Enter a valid accommodation type" });

  if (!listing_title)
    return res.status(400).json({ message: "Enter a valid listing title" });

  // optional description
  if (!roommates_needed)
    return res.status(400).json({ message: "Enter a valid roommates_needed" });

  if (!max_roommates)
    return res.status(400).json({ message: "Enter a valid max_roommates" });

  if (!lease_duration)
    return res.status(400).json({ message: "Enter a valid lease_duration" });

  if (!uploaded_on) uploaded_on = new Date();

  if (!area) return res.status(400).json({ message: "Enter a valid area" });

  if (!city) return res.status(400).json({ message: "Enter a valid city" });

  if (!state) return res.status(400).json({ message: "Enter a valid state" });

  if (!image_json)
    return res.status(400).json({ message: "Enter atleast one photo" });

  if (!listing_type || isNaN(listing_type))
    return res.status(400).json({ message: "Enter a valid listing_type" });

  if (isNaN(prefered_tenants) || !prefered_tenants)
    return res.status(400).json({ message: "Enter a valid prefered_tenant" });

  if (isNaN(furnishing) || !furnishing)
    return res.status(400).json({ message: "Enter a valid furnishing" });

  if (!is_available || typeof is_available !== "boolean")
    return res.status(400).json({ message: "Enter a valid is_available" });

  if (!bedrooms)
    return res.status(400).json({ message: "Enter a valid bedrooms" });

  if (!bathrooms)
    return res.status(400).json({ message: "Enter a valid bath" });

  if (!rent || rent <= 0)
    return res.status(400).json({ message: "Enter a valid rent" });

  if (!deposit || deposit <= 0)
    return res.status(400).json({ message: "Enter a valid deposit" });

  if (!floor_no || floor_no <= 0)
    return res.status(400).json({ message: "Enter a valid floor_no" });

  if (!total_floors || total_floors <= 0)
    return res.status(400).json({ message: "Enter a valid total_floors" });

  if (!areasqft || areasqft <= 0)
    return res.status(400).json({ message: "Enter a valid areasqft" });

  if (preference_list && preference_list.length > 0) {
    if (!Array.isArray(preference_list))
      return res.status(400).json({ message: "Enter a valid preference_list" });
    preference_list.sort((a, b) => a - b);
  }

  if (amenities_list && amenities_list.length > 0) {
    if (!Array.isArray(amenities_list))
      return res.status(400).json({ message: "Enter a valid amenities_list" });
    amenities_list.sort((a, b) => a - b);
  }

  try {
    const listing_result = await pool.query(
      `INSERT INTO listing (
      accommodation_type, listing_title, 
      listing_desc, images, uploaded_by, 
      uploaded_on, is_available, 
      area, city, state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning listing_id`,
      [
        99,
        listing_title,
        listing_desc,
        image_json,
        req.user.userID,
        uploaded_on,
        is_available,
        area,
        city,
        state,
      ]
    );

    const listing_id = listing_result.rows[0].listing_id;

    if (preference_list && preference_list.length > 0) {
      const preferenceQuery = `
        INSERT INTO preference_listing (listing_id, preference_id)
        SELECT $1, UNNEST($2::INT[])
        ON CONFLICT (listing_id, preference_id) DO NOTHING;
      `;
      await pool.query(preferenceQuery, [listing_id, preference_list]);
    }

    // Batch insert amenities (if any)
    if (amenities_list && amenities_list.length > 0) {
      const amenitiesQuery = `
        INSERT INTO listing_amenities (listing_id, amenity_id)
        SELECT $1, UNNEST($2::INT[])
        ON CONFLICT (listing_id, amenity_id) DO NOTHING;
      `;
      await pool.query(amenitiesQuery, [listing_id, amenities_list]);
    }

    pool.query(
      "INSERT INTO roommate_listing_metadata VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)",
      [
        listing_id,
        listing_type,
        roommates_needed,
        max_roommates,
        bedrooms,
        bathrooms,
        rent,
        deposit,
        furnishing,
        lease_duration,
        floor_no,
        total_floors,
        areasqft,
        is_available,
      ],
      (err, result) => {
        if (err) console.error(`Error on listing_metadata_insert ${err}`);
      }
    );

    return res.status(201).json({
      message: "Roommate listing created successfully",
      data: { listing_id: listing_result.rows[0].listing_id },
    });
  } catch (error) {
    console.error("Error creating roommate listing:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const listing_id = req.params.id;
  try {
    const cachedListing = await redisClient.hGet(
      "listing",
      `roommate-listing:${listing_id}`
    );

    if (cachedListing) {
      await incrementViewCount(listing_id);
      return res.status(200).json({ message: JSON.parse(cachedListing) });
    }

    const result = await pool.query(
      `SELECT 
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
      rlm.listing_type,
      rlm.is_available,
      rlm.bedrooms,
      rlm.bathrooms,
      rlm.rent,
      rlm.deposit,
      rlm.furnishing,
      rlm.floor,
      rlm.total_floors,
      rlm.areasqft,
      ARRAY_AGG(a.amenity_name) AS amenities
    FROM
      listing
    JOIN 
      roommate_listing_metadata rlm
    ON 
      listing.listing_id = rlm.listing_id
    LEFT JOIN 
      listing_amenities la
    ON 
      listing.listing_id = la.listing_id
    LEFT JOIN
      amenities a
    ON
      la.amenity_id = a.amenity_id 
    WHERE listing_id = $1
    GROUP BY 
      listing.listing_id,
      rlm.listing_type,
      rlm.is_available,
      rlm.bedrooms,
      rlm.bathrooms,
      rlm.rent,
      rlm.deposit,
      rlm.furnishing,
      rlm.floor,
      rlm.total_floors,
      rlm.areasqft`,
      [listing_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await redisClient.hSet(
      "listing",
      `roommate-listing:${listing_id}`,
      JSON.stringify(result.rows[0])
    );

    await redisClient.hExpire(
      "listing",
      `roommate-listing:${listing_id}`,
      settings.server.defaultCacheTimeout
    );

    await incrementViewCount(listing_id);

    return res.status(200).json({ message: result.rows[0] });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/stats", async (req, res) => {
  const listing_id = req.params.id;

  try {
    const likeCount = await getLikeCount(listing_id);
    const viewCount = await getViewCount(listing_id);
    const shareCount = await getShareCount(listing_id);

    if (likeCount !== null || viewCount !== null || shareCount !== null) {
      return res.status(200).json({
        message: { views: viewCount, likes: likeCount, shares: shareCount },
      });
    }

    const result = await pool.query(
      "SELECT views, likes, shares FROM listing_stats WHERE listing_id = $1",
      [listing_id]
    );

    if (result.rows.length !== 0) {
      const data = result.rows[0];

      Promise.all([
        setViewCount(listing_id, data.views),
        setLikeCount(listing_id, data.likes),
        setShareCount(listing_id, data.shares),
      ]);

      return res.status(200).json({ message: data });
    } else {
      return res.status(400).json({ message: "No stats found" });
    }
  } catch (error) {
    console.error("Error handling stats for listing:", error);
    return res
      .status(500)
      .json({ message: "Server error occurred. Please try again." });
  }
});

// Route to handle likes, shares, and views
router.get("/:listing_id/:action", authenticateToken, async (req, res) => {
  const listing_id = parseInt(req.params.listing_id);
  const action = req.params.action; // like, share, view

  if (!action) {
    return res.status(400).json({ message: "Action is required" });
  }

  try {
    if (action === "like") {
      incrementLikeCount(listing_id);
    }
    if (action === "share") {
      incrementShareCount(listing_id);
    }
    // if (action === "view") {
    //   await incrementViewCount(listing_id);
    // }
    return res.status(200).json({ message: `${action} incremented.` });
  } catch (error) {
    console.error("Error updating likes, shares, or views:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
