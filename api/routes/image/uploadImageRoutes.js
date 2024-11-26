const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const { randomUUID } = require("crypto");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const getUserData = require("../../functions/user");
const settings = require("../../config/settings");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload/image",
  [authenticateToken, upload.array("uploaded_images")],
  async (req, res) => {
    try {
      const userid = req.user.userID;
      if (!userid) {
        return res.status(401).json({ response: "Unauthorized" });
      }

      const imageLinks = [];

      for (const file of req.files) {
        const { buffer, originalname } = file;
        if (!buffer) {
          return res.status(400).json({ response: "No image uploaded" });
        }

        const ref = `${Date.now()}-${randomUUID()}.webp`;

        // Convert and save low-quality image
        await sharp(buffer)
          .webp({ quality: 20 })
          .toFile(`${settings.image_folder.uploaded_image_folder}${ref}`);

        const link = `/assets/upload/images/${ref}`;
        imageLinks.push(link);

        await redisClient.hSet(
          "ImageUploadLog",
          `${ref}`,
          JSON.stringify({ userid, image_path: link, uploaded_on: new Date() })
        );
      }

      return res.json({ response: imageLinks }); // Return an array of links
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response: error });
    }
  }
);

router.post(
  "/upload/profile",
  [authenticateToken, upload.single("uploaded_file")],
  async (req, res) => {
    try {
      const userid = req.user.userID;
      if (!userid) {
        res.status(401).json({ response: "Unauthorized" });
      }

      const { buffer, originalname } = req.file;
      if (!buffer) {
        return res.status(400).json({ response: "No image uploaded" });
      }
      const ref = `${require("crypto")
        .createHash("md5")
        .update(userid)
        .digest("hex")}.webp`;
      // Convert and save low-quality image
      await sharp(buffer)
        .webp({ quality: 20 })
        .toFile(settings.image_folder.uploaded_profile_folder + ref);
      const link = `/assets/upload/profile/${ref}`;
      await Promise.all([
        redisClient.hSet(
          "ImageUploadLog",
          `${ref}`,
          JSON.stringify({ userid, image_path: link, uploaded_on: new Date() })
        ),
        pool.query(`UPDATE users SET avatar = $1 WHERE user_id = $2`, [
          link,
          userid,
        ]),
      ]);

      await getUserData(userid, true);
      return res.json({ response: link });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response: error });
    }
  }
);

module.exports = router;
