const express = require("express");
const pool = require("../../config/db");
const { authenticateToken } = require("../../middleware/jwtMiddleware");

const router = express.Router();

// TODO: check for phone number is verified or not while creating new listing

router.get("/", async (req, res) => {
  const offset = req.query.offset || 0;
  const result = await pool.query("SELECT * from listing LIMIT 20 offset $1", [
    offset,
  ]);

  return res.status(200).json({ message: "Listing", data: result.rows });
});

router.post("/create", authenticateToken, (req, res) => {
  let {
    property_title,
    property_desc,
    image_json,
    uploaded_on,
    location_pin,
    city,
    state,
    listing_type,
  } = req.body;

  if (!property_title) {
    return res.status(400).json({ message: "Enter a valid property title" });
  }

  if (!uploaded_on) {
    uploaded_on = new Date();
  }

  if (!location_pin) {
    return res.status(400).json({ message: "Enter a valid location pin" });
  }

  if (!city) {
    return res.status(400).json({ message: "Enter a valid city" });
  }

  if (!state) {
    return res.status(400).json({ message: "Enter a valid state" });
  }

  if (!listing_type) {
    return res.status(400).json({ message: "Enter a valid listing type" });
  }

  // db insert{listing}
  try {
    const result = await.pool.query(
      `INSERT INTO listing (property_title, property_desc, images, uploadedBy, uploadedOn, location, city, state, listingType) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) `,
      [
        property_title,
        property_desc,
        image_json, // TODO: this will be json array of image
        req.user.user_id, // Assuming user_id is available from the JWT token
        uploaded_on,
        location_pin,
        city,
        state,
        listing_type,
      ]
    );

    return res.status(201).json({ message: "Listing created successfully", data: result.rows[0] });
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
  const result = await pool.query("SELECT * FROM listing WHERE property_id = $1", [listingId]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Listing not found" });
  }

  await redisClient.set(`listing:${listingId}`, JSON.stringify(result.rows[0]), 'EX', 3600); // Cache for 1 hour

    return res.status(200).json({ message: result.rows[0] });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
