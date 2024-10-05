const express = require("express");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const { randomUUID } = require("crypto");
const { authenticateToken } = require("../../middleware/jwtMiddleware");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const profile_folder = "../../public/assets/profile";

router.post(
  "/upload/profile",
  [authenticateToken, upload.single("uploaded_file")],
  async (req, res) => {
    try {
      const userid = req.user.userID;
      if (!userid) {
        res.status(401).json({ response: "Unauthorized" });
      }

      // Create directories if they don't exist
      fs.access(profile_folder, (error) => {
        if (error) {
          fs.mkdirSync(profile_folder);
        }
      });

      const { buffer, originalname } = req.file;
      const ref = `${Date.now()}-${randomUUID}.webp`;

      // Convert and save low-quality image
      await sharp(buffer)
        .webp({ quality: 20 })
        .toFile(profile_folder + ref);
      const link = `/assets/profile/${ref}`;

      // TODO: insert log into database
      await redisClient.hSet(
        "ImageUploadLog",
        `${ref}`,
        JSON.stringify({ userid, image_path: link, uploaded_on: new Date() })
      );

      await pool.query(`UPDATE users SET avatar = $1 WHERE user_id = $2`, [
        link,
        userid,
      ]);

      return res.json({ response: link });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response: error });
    }
  }
);

module.exports = router;
{
  /* <form action="http://localhost:3001/upload" enctype="multipart/form-data" method="post">
    <div class="form-group">
      <input type="file" class="form-control-file" name="uploaded_file">
      <input type="text" class="form-control" placeholder="Number of speakers" name="nspeakers">
      <input type="submit" value="Get me the stats!" class="btn btn-default">            
    </div>
  </form> */
}
