const express = require("express");
const pool = require("../../config/db");

const router = express.Router();

// check for phone number and phone number is verified or not
//  while creating new listing

router.get("/", async (req, res) => {
  const offset = req.query.offset || 0;
  const result = await pool.query("SELECT * from listing LIMIT 2 offset $1", [
    offset,
  ]);

  return res.status(200).json({ message: "Listing", data: result.rows });
});

router.post("/create", (req, res) => {
  let {
    property_title,
    property_desc,
    image_json,
    uploaded_by,
    uploaded_on,
    location_pin,
    city,
    state,
    listing_type,
    preferenceid,
  } = req.body;

  if (!property_title) {
    return res.status(400).json({ message: "Enter a valid property title" });
  }

  if (!uploaded_by){
    return res.status(400).json({ message: "Enter a valid user id" });
  }

  if (!uploaded_on){
    uploaded_on = new Date();
  }

  if (!location_pin){
    return res.status(400).json({ message: "Enter a valid location pin" });
  }

  if (!city){
    return res.status(400).json({ message: "Enter a valid city" });
  }

  if (!state){
    return res.status(400).json({ message: "Enter a valid state" });
  }

  if (!listing_type){
    return res.status(400).json({ message: "Enter a valid listing type" });
  }



});

module.exports = router;
