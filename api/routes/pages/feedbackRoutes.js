const express = require("express");
const pool = require("../../config/db");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const redisClient = require("../../config/dbredis");

const router = express.Router();

// POST request to handle feedback submission
router.post("/", authenticateToken, async (req, res) => {
  const { email, message } = req.body;

  // Validating the required fields
  if (!email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    await redisClient.hSet("feedback", `${req.user.userID}|${new Date()}`, JSON.stringify({ email, message }));

    return res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    // Handling server-side errors
    console.error("Error saving feedback:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Method not allowed for any request other than POST
router.use((req, res) => {
  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
});

module.exports = router;
