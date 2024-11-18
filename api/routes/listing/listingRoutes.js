const express = require("express");
const pool = require("../../config/db");
const redisClient = require("../../config/dbredis");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const settings = require("../../config/settings");
const getUserData = require("../../functions/user");

const router = express.Router();

router.get("/", async (req, res) => {
  const offset = Number(req.query.offset) || 0;
  const bhk = Number(req.query.bhk);
  const rentMin = Number(req.query.rentMin) || 0;
  const rentMax = Number(req.query.rentMax) || 999999;
  const depositMin = Number(req.query.depositMin) || 0;
  const depositMax = Number(req.query.depositMax) || 999999;
  const bathrooms = Number(req.query.bathrooms);
  const type = Number(req.query.type);
  const tenants = Number(req.query.tenants);
  const furnishing = Number(req.query.furnishing);
  const amenities = req.query.amenities ? req.query.amenities.split(",") : [];
  const preferences = req.query.preferences
    ? req.query.preferences.split(",")
    : [];

  let filters = [];
  let values = [offset];
  let idx = 2;

  // Add filters dynamically
  if (bhk) {
    filters.push(`lm.bedrooms = $${idx++}`);
    values.push(bhk);
  }
  if (rentMin !== undefined && rentMax !== undefined) {
    filters.push(`lm.rent BETWEEN $${idx++} AND $${idx++}`);
    values.push(rentMin, rentMax);
  }
  if (depositMin !== undefined && depositMax !== undefined) {
    filters.push(`lm.deposit BETWEEN $${idx++} AND $${idx++}`);
    values.push(depositMin, depositMax);
  }
  if (bathrooms) {
    filters.push(`lm.bathrooms = $${idx++}`);
    values.push(bathrooms);
  }
  if (type) {
    filters.push(`lm.listing_type = $${idx++}`);
    values.push(type);
  }
  if (tenants) {
    filters.push(`lm.prefered_tenants = $${idx++}`);
    values.push(tenants);
  }
  if (furnishing) {
    filters.push(`lm.furnishing = $${idx++}`);
    values.push(furnishing);
  }
  if (amenities.length) {
    filters.push(`a.amenity_name = ANY($${idx++})`);
    values.push(amenities);
  }
  if (preferences.length) {
    filters.push(`
      EXISTS (
        SELECT 1 FROM preference_listing pl
        WHERE pl.listing_id = listing.listing_id
        AND pl.preference_id = ANY($${idx++})
      )
    `);
    values.push(preferences.map(Number));
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  // TODO: fix this
  // let data = await redisClient.get(`listings-${offset}-${JSON.stringify(req.query)}`);
  // if (data) {
  //   return res.status(200).json({ message: "Listing", data: JSON.parse(data) });
  // }

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
    ORDER BY listing.listing_id DESC
    LIMIT ${settings.database.limit} 
    OFFSET $1
  `;

  try {
    const result = await pool.query(query, values);

    // // Cache the results in Redis
    // await redisClient.set(
    //   `listings-${offset}-${JSON.stringify(req.query)}`,
    //   JSON.stringify(result.rows),
    //   "EX",
    //   3600 // Cache for 1 hour
    // );

    return res.status(200).json({ message: "Listing", data: result.rows });
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
    accommodation_type,
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
  } = req.body;

  if (!accommodation_type)
    return res
      .status(400)
      .json({ message: "Enter a valid accommodation type" });

  if (!listing_title)
    return res.status(400).json({ message: "Enter a valid listing title" });

  // optional description

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
        accommodation_type,
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

    await pool.query(
      "INSERT INTO listing_metadata VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
      [
        listing_id,
        listing_type,
        prefered_tenants,
        is_available,
        bedrooms,
        bathrooms,
        rent,
        deposit,
        furnishing,
        floor_no,
        total_floors,
        areasqft,
      ],
      (err, result) => {
        if (err) console.error(`Error on listing_metadata_insert ${err}`);
      }
    );

    return res.status(201).json({
      message: "Listing created successfully",
      data: { listing_id: listing_result.rows[0].listing_id },
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const listing_id = req.params.id;
  try {
    const cachedListing = await redisClient.get(`listing:${listing_id}`);

    if (cachedListing) {
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
          listing_amenities la
      ON 
          listing.listing_id = la.listing_id
      LEFT JOIN
          amenities a
      ON
          la.amenity_id = a.amenity_id 
      WHERE listing.listing_id = $1
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
          lm.areasqft`,
      [listing_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await redisClient.setEx(
      `listing:${listing_id}`,
      settings.server.defaultCacheTimeout,
      JSON.stringify(result.rows[0])
    );

    return res.status(200).json({ message: result.rows[0] });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// router.get("/:id/stats", async (req, res) => {
//   const listing_id = req.params.id;
//   const statsKey = `stats:${listing_id}`;

//   try {
//     const cachedStats = await redisClient.hGet("stats", listing_id);

//     if (cachedStats) {
//       return res.status(200).json({
//         message: JSON.parse(cachedStats),
//       });
//     }

//     const result = await pool.query(
//       "SELECT views, likes, shares FROM listing_stats WHERE listing_id = $1",
//       [listing_id]
//     );
//     if (result.rows.length !== 0) {
//       const data = result.rows[0];
//       await redisClient.hset("stats", listing_id, JSON.stringify(data));
//       return res.status(200).json({ message: data });
//     } else {
//       return res.status(400).json({ message: "No stats found" });
//     }
//   } catch (error) {
//     console.error("Error handling stats for listing:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error occurred. Please try again." });
//   }}

//   // Route to handle likes, shares, and views
//   router.get("/:id/:action", async (req, res) => {
//     const listing_id = parseInt(req.params.id);
//     const action = req.params.action; // like, share, view

//     if (!action) {
//       return res.status(400).json({ message: "Action is required" });
//     }

//     try {
//       // Check if stats for the listing are cached
//       let cachedStats = await redisClient.hget("stats", listing_id);

//       if (!cachedStats) {
//         // Fetch stats from the database if not cached
//         const result = await pool.query(
//           "SELECT views, likes, shares FROM listing_stats WHERE listing_id = $1",
//           [listing_id]
//         );

//         if (result.rows.length !== 0) {
//           cachedStats = JSON.stringify(result.rows[0]);
//           // TODO: yaha pe 3 if statement aye ge joh view, like, share ke liye hoge
//           // and if condition ke block me incremnt honge respective values
//           // and then redis me hset hoga
//           return res.status(200).json({ message: JSON.parse(cachedStats) });
//         } else {
//           return res.status(400).json({ message: "No stats found" });
//         }

//         // Cache the stats
//         await redisClient.hset("stats", listing_id, cachedStats);
//       }

//       const stats = JSON.parse(cachedStats);

//       // Update stats based on the action
//       if (action === "view") {
//         stats.views += 1;
//       } else if (action === "like") {
//         stats.likes += 1;
//       } else if (action === "share") {
//         stats.shares += 1;
//       } else {
//         return res.status(400).json({ message: "Invalid action specified" });
//       }

//       // Save updated stats back to Redis
//       await redisClient.hset("stats", listing_id, JSON.stringify(stats));

//       // Update stats in the database
//       await pool.query(
//         "UPDATE listing_stats SET views = $1, likes = $2, shares = $3 WHERE listing_id = $4",
//         [stats.views, stats.likes, stats.shares, listing_id]
//       );

//       return res.status(200).json({ message: stats });
//     } catch (error) {
//       console.error("Error updating likes, shares, or views:", error);
//       return res.status(500).json({ message: "Server error" });
//     }
//   });
// });

module.exports = router;
