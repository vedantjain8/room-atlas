const express = require("express");
const pool = require("../../config/db");
const { authenticateToken } = require("../../middleware/jwtMiddleware");

const router = express.Router();

// TODO: check for phone number is verified or not while creating new listing

router.get("/", async (req, res) => {
  const offset = req.query.offset || 0;
  const result = await pool.query(`
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
    ARRAY_AGG(a.amenity_name) AS amenities -- Add the missing comma before this line
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
    LIMIT 20 offset $1`,
    [offset]);


  return res.status(200).json({ message: "Listing", data: result.rows });
});

router.post("/create", authenticateToken, async (req, res) => {
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
    depost,
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

  if (
    isNaN(listing_type) ? !1 : ((x = parseInt(listing_type)), (0 | x) === x)
  )
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

  if (!depost || depost <= 0)
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

    // if (preference_list.length > 0) {
    //   for (const preferences of preference_list) {
    //     await pool.query(
    //       "INSERT INTO preference_listing_link VALUES ($1, $2)",
    //       [listing_id, preferences],
    //       (err, result) => {
    //         if (err)
    //           console.error(`Error on preference_listing_link_insert ${err}`);
    //       }
    //     );
    //   }
    // }

    // if (amenities_list.length > 0) {
    //   for (const amenities of amenities_list) {
    //     await pool.query(
    //       "INSERT INTO listing_amenities VALUES ($1, $2)",
    //       [listing_id, amenities],
    //       (err, result) => {
    //         if (err) console.error(`Error on listing_amenities_insert ${err}`);
    //       }
    //     );
    //   }
    // }
    
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
        depost,
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
// if any pending validation

// ====not this one
// link the preference to the listing
// return the listing view url path
// ====not this one

// show the listing view page

router.get("/:id", async (req, res) => {
  const listingId = req.params.id;
  // use get method

  // use redis, db cache
  try {
    const cachedListing = await redisClient.get(`listing:${listingId}`);

    if (cachedListing) {
      return res.status(200).json({ message: JSON.parse(cachedListing) });
    }
    // If not in cache, fetch from the database

    // TODO: show only required fields
    const result = await pool.query(
      "SELECT * FROM listing WHERE listing_id = $1",
      [listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await redisClient.set(
      `listing:${listingId}`,
      JSON.stringify(result.rows[0]),
      "EX",
      3600
    ); // Cache for 1 hour

    return res.status(200).json({ message: result.rows[0] });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
