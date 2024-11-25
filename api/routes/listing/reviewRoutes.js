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

router.get("/:listing_id", async (req, res) => {
  const listing_id = req.params.listing_id;
  const reviewData = [];

  // // Check if data exists in cache
  // const cache = await redisClient.hGet("listing_reviews", listing_id);
  // if (cache) {
  //   return res.status(200).json({ message: JSON.parse(cache) });
  // }

  try {
    // Fetch reviews for the given listing
    const result = await pool.query(
      "SELECT review, user_id FROM listing_review WHERE listing_id = $1",
      [listing_id]
    );

    const reviews = result.rows;
    const allUserIds = reviews.map((review) => review.user_id);

    // Fetch unique user data
    const allUserData = await Promise.all(
      allUserIds.map(async (id) => {
        return await getUserData(id);
      })
    );

    const enrichedReviews = reviews.map((review, index) => ({
      review: review.review,
      user: allUserData[index] || null,
    }));

    reviewData.push(...enrichedReviews);
    return res.status(200).json({ message: reviewData });

    // const uniqueUserIds = new Set(reviews.map((review) => review.user_id));
    // const userData = await Promise.all(
    //   Array.from(uniqueUserIds).map(async (userId) => {
    //     try {
    //       return await getUserData(userId);
    //     } catch (err) {
    //       console.error(`Failed to fetch data for user ID: ${userId}`, err);
    //       return null; // Handle errors without breaking other requests
    //     }
    //   })
    // );

    // // Create a user data map for quick access
    // const userMap = new Map(
    //   userData
    //     .filter((user) => user !== null) // Exclude null entries
    //     .map((user) => [user.user_id, user]) // Map user_id to user data
    // );

    // // Combine reviews with corresponding user data
    // const enrichedReviews = reviews.map((review) => ({
    //   ...review,
    //   user: userMap.get(review.user_id) || null, // Include user data or null
    // }));

    // // Cache the enriched reviews
    // await redisClient.hSet(
    //   "listing_reviews",
    //   listing_id,
    //   JSON.stringify(enrichedReviews)
    // );

    // // Respond with enriched reviews
    // return res.status(200).json({ message: enrichedReviews });
  } catch (error) {
    console.error("Error fetching listing reviews:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;