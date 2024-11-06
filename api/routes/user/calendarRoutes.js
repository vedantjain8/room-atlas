const express = require("express");
const pool = require("../../config/db");
const router = express.Router();

// TODO: move this function to a helper file
const convertToUTC = (date) => {
  const localDate = new Date(
    date.year,
    date.month - 1, // Adjust month to be zero-based
    date.day,
    date.hour,
    date.minute,
    0
  );
  const utcDate = new Date(localDate.toUTCString());
  return `${utcDate.getUTCFullYear()}${String(
    utcDate.getUTCMonth() + 1 // Adjust month to be 1-based
  ).padStart(2, "0")}${String(utcDate.getUTCDate()).padStart(2, "0")}T${String(
    utcDate.getUTCHours()
  ).padStart(2, "0")}${String(utcDate.getUTCMinutes()).padStart(2, "0")}00Z`;
};

// IDEA: can create a telementry function to count the number of times this endpoint is hit to calculate the use of this feature
router.post("/new", async (req, res) => {
  const { date, senderid, receiverid, listingid } = req.body;

  if (!date || !senderid || !receiverid || !listingid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let eventDescription = `https://www.google.com/maps/search/21.15150934008922,+72.79589313405597`;

  let eventLocation;

  const result = await pool.query(
    "select (select username from users where user_id=$1) as sender, (select username from users where user_id=$2) as receiver, (select area from listing where listing_id = $3) as location",
    [senderid, receiverid, listingid]
  );

  const sender = result.rows[0].sender;
  const receiver = result.rows[0].receiver;
  const location = result.rows[0].location;

  const eventTitle = `Meeting with ${sender} and ${receiver} for property at ${location}`;

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
    "INSERT INTO calendar (listing_id, user1_id, user2_id, event_start_date) VALUES ($1, $2, $3, $4)",
    [listingid, senderid, receiverid, eventStartDate]
  );

  url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDescription}&location=${eventLocation}&dates=${eventStartDate}%2F${eventEndDate}`;

  res.status(200).json({ message: "Event created", url: url });
});

module.exports = router;
