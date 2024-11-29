var cron = require("node-cron");
const redisClient = require("../config/dbredis");
const pool = require("../config/db");

async function ImageLog2Database() {
  const all = await redisClient.hGetAll("ImageUploadLog");
  for (const key in all) {
    const element = all[key];
    const { userid, image_path, uploaded_on } = JSON.parse(element);
    const query = `INSERT INTO image_upload_log (user_id, image_path, uploaded_on) VALUES ($1, $2, $3)`;
    try {
      pool.query(query, [userid, image_path, uploaded_on], (err, res) => {
        if (err) {
          console.error(err);
        } else {
          redisClient.hDel("ImageUploadLog", key);
        }
      });
      console.log("Image Upload Log cron job ran");
    } catch (err) {
      console.error(`Error saving image upload log to Database: ${err}`);
    }
  }
}

cron.schedule("0 0 * * *", () => {
  //   console.log('running a task every midnight');
  ImageLog2Database();
});
