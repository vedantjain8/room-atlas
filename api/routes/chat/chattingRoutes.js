const express = require("express");
const pool = require("../../config/db");
const settings = require("../../config/settings");

const router = express.Router();

router.get("/chat-history/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;

  try {
    if (!sender || !receiver || sender == undefined || receiver == undefined) {
      return res.status(400);
    }
    const offset = req.query.offset || 0;
    const query = `
    SELECT * FROM messages
    WHERE (sender_id = ${sender} AND receiver_id = ${receiver})
    OR (sender_id = ${receiver} AND receiver_id = ${sender})
    ORDER BY created_at ASC 
    LIMIT ${settings.database.limit}
    OFFSET ${offset}
    `;
    const result = await pool.query(query);
    return res.status(200).json({ message: result.rows });
  } catch (err) {
    console.error("error at chat-history", err);
    return res.status(500).json({ message: [] });
  }
});

module.exports = router;
