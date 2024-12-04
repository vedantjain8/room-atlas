const express = require("express");
const pool = require("../../config/db");
const settings = require("../../config/settings");
const getUserData = require("../../functions/user");

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

router.get("/people/:sender", async (req, res) => {
  const { sender } = req.params;
  const userData = [];
  const uniqueUserIds = new Set(); // To track unique user IDs

  try {
    // Fetch the distinct receiver IDs
    const receiverResult = await pool.query(
      "SELECT DISTINCT(receiver_id) FROM messages WHERE sender_id = $1",
      [sender],
    );

    const senderResult = await pool.query(
      "SELECT DISTINCT(sender_id) FROM messages WHERE receiver_id = $1",
      [sender],
    );

    // Extract receiver and sender IDs
    const receiverIds = receiverResult.rows.map((row) => row.receiver_id);
    const senderIds = senderResult.rows.map((row) => row.sender_id);

    // Combine receiver and sender IDs into one array
    const allUserIds = [...receiverIds, ...senderIds];

    // Fetch user data for unique IDs using Promise.all
    const allUserData = await Promise.all(
      allUserIds.map(async (id) => {
        if (!uniqueUserIds.has(id)) {
          // Check if ID is unique
          uniqueUserIds.add(id);
          return await getUserData(id);
        }
        return null; // Skip if ID is not unique
      }),
    );

    // Filter out null values from skipped IDs
    userData.push(...allUserData.filter((data) => data !== null));

    // Send the combined data as the response
    return res.status(200).json({ message: userData });
  } catch (err) {
    console.error("Error at messages-history: ", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
