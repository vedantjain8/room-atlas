var cron = require("node-cron");
const redisClient = require("../config/dbredis");
const {
  getViewCount,
  getLikeCount,
  getShareCount,
} = require("../functions/stats");
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

async function updateStats() {
  const viewCount = await redisClient.hGetAll("viewCount");
  if (viewCount && Object.keys(viewCount).length > 0) {
    let params = [];

    for (key in viewCount) {
      const listingID = key;
      const likeCount = await getLikeCount(listingID);
      const viewCount = await getViewCount(listingID);
      const shareCount = await getShareCount(listingID);

      params.push([listingID, viewCount, likeCount, shareCount]);
    }

    const cases = {
      views: [],
      likes: [],
      shares: [],
      ids: [],
    };

    params.forEach(([listingID, viewCount, likeCount, shareCount]) => {
      if (typeof viewCount === "number" && viewCount !== 0) {
        cases.views.push(`WHEN ${listingID} THEN ${viewCount}`);
      }
      if (typeof likeCount === "number" && likeCount !== 0) {
        cases.likes.push(`WHEN ${listingID} THEN ${likeCount}`);
      }
      if (typeof shareCount === "number" && shareCount !== 0) {
        cases.shares.push(`WHEN ${listingID} THEN ${shareCount}`);
      }
      cases.ids.push(listingID);
    });

    const query = `
    UPDATE listing_stats
    SET 
      views = CASE listing_id ${cases.views.join(" ")} ELSE views END,
      likes = CASE listing_id ${cases.likes.join(" ")} ELSE likes END,
      shares = CASE listing_id ${cases.shares.join(" ")} ELSE shares END
    WHERE listing_id IN (${cases.ids.join(", ")});
  `;

    pool.query(query, (err, result) => {
      if (err) {
        console.error("Error updating stats:", err, "with query: ", query);
        return;
      }
      if (result) {
        params = [];
        cases.views = [];
        cases.likes = [];
        cases.shares = [];
        cases.ids = [];
        console.log("Stats updated successfully");
      }
    });
  }
}

cron.schedule("0 * * * *", async () => {
  // run every 1 hour
  feedbackCronJob();
  updateStats();
});
