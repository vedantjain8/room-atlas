var cron = require("node-cron");
const redisClient = require("../config/dbredis");
const pool = require("../config/db");
require("dotenv").config();

async function feedbackCronJob() {
  const queue = await redisClient.hGetAll("feedback");
  if (!queue) {
    return;
  }
  let insertParams = [];
  for (const [key, value] of Object.entries(queue)) {
    const email = JSON.parse(value).email;
    const message = JSON.parse(value).message;
    const user_id = key.split("|")[0];
    const created_at = new Date(key.split("|")[1]).toISOString();
    insertParams.push(
      `('${user_id}', '${email}', '${message}', '${created_at}')`
    );
  }

  if (insertParams.length > 0) {
    const query = `INSERT INTO feedback (user_id, email, message, created_at) VALUES ${insertParams.join(
      ","
    )}`;

    pool.query(query, async (err, result) => {
      if (err) {
        console.error("Error saving feedback to Database:", err);
        return;
      }
      await redisClient.hDel("feedback", Object.keys(queue));
      console.log("Feedback saved successfully");
    });
  }
}

cron.schedule("*/10 * * * * *", async () => {
  // run every 1 hour
  feedbackCronJob();
});
