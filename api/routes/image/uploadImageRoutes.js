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

const uploaded_image_folder = "public/assets/upload/images/";

router.post(
  "/upload/image",
  [authenticateToken, upload.array("uploaded_images")],
  async (req, res) => {
    try {
      const userid = req.user.userID;
      if (!userid) {
        return res.status(401).json({ response: "Unauthorized" });
      }

      // Create directories if they don't exist
      fs.access(uploaded_image_folder, (error) => {
        if (error) {
          fs.mkdirSync(uploaded_image_folder);
        }
      });

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
          .toFile(`${uploaded_image_folder}${ref}`);

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

module.exports = router;
