const express = require("express");
const pool = require("../../config/db");
const router = express.Router();
const { convertToUTC } = require("../../functions/helper");
const getUserData = require("../../functions/user");

// IDEA: can create a telementry function to count the number of times this endpoint is hit to calculate the use of this feature

router.get("/busy/:receiverid", async (req, res) => {
  const receiverid = req.params.receiverid;
  const result = await pool.query(
    "SELECT event_start_date FROM calendar WHERE user2_id=$1",
    [receiverid]
  );

  const data = result.rows;
  res.status(200).json({ message: data });
});

router.post("/new", async (req, res) => {
  const { date, senderid, receiverid, message } = req.body;

  if (!date || !senderid || !receiverid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let eventDescription = `${message ?? ""}
  
  Location: https://www.google.com/maps/search/21.15150934008922,+72.79589313405597`;

  try {
    const senderUsername = await getUserData(senderid).username;
    const receiverUsername = await getUserData(receiverid).username;

    const eventTitle = `Meeting with ${senderUsername} and ${receiverUsername} for property viewing`;

    const eventStartDate = convertToUTC(date);

    const endDate = new Date(
      date.year,
      date.month,
      date.day,
      date.hour,
      date.minute
    );
    endDate.setHours(endDate.getHours() + 1);
    const eventEndDate = convertToUTC({
      year: endDate.getFullYear(),
      month: endDate.getMonth(),
      day: endDate.getDate(),
      hour: endDate.getHours(),
      minute: endDate.getMinutes(),
    });

    await pool.query(
      "INSERT INTO calendar (user1_id, user2_id, event_start_date) VALUES ($1, $2, $3)",
      [senderid, receiverid, eventStartDate]
    );

    url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDescription}&location=&dates=${eventStartDate}%2F${eventEndDate}`;

    return res.status(200).json({ message: "Event created", url: url });
  } catch (err) {
    console.error("Error creating event: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
