const express = require("express");
const pool = require("../../config/db");
const redisClient = require("../../config/dbredis");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const settings = require("../../config/settings");
const getUserData = require("../../functions/user");

const router = express.Router();

router.get("/", async (req, res) => {
  const offset = Number(req.query.offset) || 0;
  let data = await redisClient.get(`listings-${offset}`);
  if (data) {
    return res.status(200).json({ message: "Listing", data: JSON.parse(data) });
  }
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
    listing.location,
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
    LIMIT ${settings.database.limit} offset $1`,
    [offset]
  );

  await redisClient.set(`listings-${offset}`, JSON.stringify(result.rows));

  return res.status(200).json({ message: "Listing", data: result.rows });
});

router.post("/create", authenticateToken, async (req, res) => {
  const userdata = await getUserData(req.user.userID);
  if (userdata.email_verified === false)
    return res.status(400).json({ message: "Email not verified" });

  let {
    listing_title,
    listing_desc = null,
    image_json,
    uploaded_on,
    location_pin,
    city,
    state,
    preference_list = [],
    amenities_list = [],
    listing_type, // Appartment, villa, bungalow
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

  if (!listing_title)
    return res.status(400).json({ message: "Enter a valid listing title" });

  // optional description

  if (!uploaded_on) uploaded_on = new Date();

  if (!location_pin)
    return res.status(400).json({ message: "Enter a valid location pin" });

  if (!city) return res.status(400).json({ message: "Enter a valid city" });

  if (!state) return res.status(400).json({ message: "Enter a valid state" });

  if (!image_json)
    return res.status(400).json({ message: "Enter atleast one photo" });

  if (isNaN(listing_type) ? !1 : ((x = parseInt(listing_type)), (0 | x) === x))
    return res.status(400).json({ message: "Enter a valid listing_type" });

  if (
    isNaN(prefered_tenants)
      ? !1
      : ((x = parseInt(prefered_tenants)), (0 | x) === x)
  )
    return res.status(400).json({ message: "Enter a valid prefered_tenant" });

  if (isNaN(furnishing) ? !1 : ((x = parseInt(furnishing)), (0 | x) === x))
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

  try {
    const listing_result = await pool.query(
      `INSERT INTO listing (listing_title, listing_desc, images, uploadedBy, uploadedOn, location, city, state) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning listing_id`,
      [
        listing_title,
        listing_desc,
        image_json,
        req.user.user_id,
        uploaded_on,
        location_pin,
        city,
        state,
      ]
    );

    const listing_id = listing_result.rows[0].listing_id;

    if (preference_list && preference_list.length > 0) {
      const preferenceQuery = `
        INSERT INTO preference_listing_link (listing_id, preference_id)
        SELECT $1, UNNEST($2::INT[])
        ON CONFLICT (listing_id, preference_id) DO NOTHING;
      `;
      await client.query(preferenceQuery, [listing_id, preference_list]);
    }

    // Batch insert amenities (if any)
    if (amenities_list && amenities_list.length > 0) {
      const amenitiesQuery = `
        INSERT INTO listing_amenities (listing_id, amenity_id)
        SELECT $1, UNNEST($2::INT[])
        ON CONFLICT (listing_id, amenity_id) DO NOTHING;
      `;
      await client.query(amenitiesQuery, [listing_id, amenities_list]);
    }

    await pool.query(
      "INSERT INTO listing_metadata VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
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

    return res
      .status(201)
      .json({ message: "Listing created successfully", data: result.rows[0] });
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
          listing.location,
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

module.exports = router;
