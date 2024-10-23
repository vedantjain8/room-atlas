const express = require("express");
const pool = require("../../config/db");

const router = express.Router();

router.get('/chat-history/:sender/:receiver', async (req, res) => {
    const { sender, receiver } = req.params;
    const offset = req.query.offset || 0;
    const query = `
        SELECT * FROM messages
        WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY created_at ASC 
        OFFSET $3
        `;
        // LIMIT 10 
    const result = await pool.query(query, [sender, receiver, offset]);
    res.json(result.rows);
  });

module.exports = router;
