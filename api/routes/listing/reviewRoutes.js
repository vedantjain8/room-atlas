const router = require("express").Router();
const pool = require("../../config/db");
const redisClient = require("../../config/dbredis");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const getUserData = require("../../functions/user");

router.post("/create", authenticateToken, async (req, res) => {
  const { review, user_id, listing_id } = req.body;

  if (!review || !user_id || !listing_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = getUserData(user_id);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  try {
    await pool.query(
      "INSERT INTO listing_review (listing_id, review, user_id) VALUES ($1, $2, $3)",
      [listing_id, review, user_id]
    );
    await redisClient.hDel("listing_reviews", listing_id);
  } catch (error) {
    if (error.code == "23505")
      return res.status(409).json({ message: "Review already exists" });
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }

  res.status(200).json({ message: "Review created" });
});

router.get("/", async (req, res) => {
  const listing_id = req.body.listing_id;

  const cache = await redisClient.hGet("listing_reviews", listing_id);
  if (cache) {
    return res.status(200).json({ message: JSON.parse(cache) });
  }

  try {
    const result = await pool.query(
      "SELECT review FROM listing_review WHERE listing_id=$1",
      [listing_id]
    );

    await redisClient.hSet(
      "listing_reviews",
      listing_id,
      JSON.stringify(result.rows)
    );

    const data = result.rows;
    return res.status(200).json({ message: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
