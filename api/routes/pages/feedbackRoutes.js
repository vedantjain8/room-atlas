const express = require("express");
const pool = require("../../config/db");
const { authenticateToken } = require("../../middleware/jwtMiddleware");

const router = express.Router();

// POST request to handle feedback submission
router.post("/", authenticateToken, async (req, res) => {
  const { name, email, message } = req.body;

  // Validating the required fields
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const query = `
      INSERT INTO feedback (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, email, message];
    
    const result = await pool.query(query, values);

    // Successfully inserting feedback
    return res.status(201).json({ message: "Submitted successfully", feedback: result.rows[0] });
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