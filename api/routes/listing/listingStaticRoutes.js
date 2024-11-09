const express = require("express");
const pool = require("../../config/db");
const redisClient = require("../../config/dbredis");

const router = express.Router();

router.get("/amenities", async (req, res) => {
  const cachedData = await redisClient.get("amenities");
  if (cachedData) {
    return res.status(200).json({ message: JSON.parse(cachedData) });
  }
  const result = await pool.query("SELECT * FROM amenities");

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "No amenities found" });
  }

  await redisClient.set("amenities", JSON.stringify(result.rows));
  return res.status(200).json({ message: result.rows });
});

router.get("/preferences", async (req, res) => {
  const cachedData = await redisClient.get("preferences");
  if (cachedData) {
    return res.status(200).json({ message: JSON.parse(cachedData) });
  }
  const result = await pool.query("SELECT * FROM preferences");

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "No preferences found" });
  }

  await redisClient.set("preferences", JSON.stringify(result.rows));
  return res.status(200).json({ message: result.rows });
});

module.exports = router;
