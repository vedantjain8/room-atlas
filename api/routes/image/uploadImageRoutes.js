const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const redisClient = require("../../config/dbredis");
const pool = require("../../config/db");
const { randomUUID } = require("crypto");
const { authenticateToken } = require("../../middleware/jwtMiddleware");
const getUserData = require("../../functions/user");
const settings = require("../../config/settings");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        const { buffer } = file;
        if (!buffer) {
          return res.status(400).json({ response: "No image uploaded" });
        }

        // Process image with Sharp before uploading to Cloudinary
        const processedBuffer = await sharp(buffer)
          .webp({ quality: 80 })
          .toBuffer();

        // Upload to Cloudinary
        const uploadResponse = await new Promise((resolve) => {
          cloudinary.uploader
            .upload_stream((error, uploadResult) => {
              if (error) throw error;
              return resolve(uploadResult);
            })
            .end(processedBuffer);
        });

        const link = uploadResponse.secure_url; // Get the uploaded image URL
        imageLinks.push(link);

        // Store image metadata in Redis
        await redisClient.hSet(
          "ImageUploadLog",
          `${uploadResponse.public_id}`,
          JSON.stringify({ userid, image_path: link, uploaded_on: new Date() }),
        );
      }

      return res.json({ response: imageLinks }); // Return array of Cloudinary links
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response: error });
    }
  },
);

router.post(
  "/upload/profile",
  [authenticateToken, upload.single("uploaded_file")],
  async (req, res) => {
    try {
      const userid = req.user.userID;
      if (!userid) {
        return res.status(401).json({ response: "Unauthorized" });
      }

      const { buffer } = req.file;
      if (!buffer) {
        return res.status(400).json({ response: "No image uploaded" });
      }

      // Process image with Sharp before uploading to Cloudinary
      const processedBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve) => {
        cloudinary.uploader
          .upload_stream((error, uploadResult) => {
            if (error) throw error;
            return resolve(uploadResult);
          })
          .end(processedBuffer);
      });

      const link = uploadResponse.secure_url; // Get the uploaded image URL

      // Update avatar in Redis and Database
      await Promise.all([
        redisClient.hSet(
          "ImageUploadLog",
          `${uploadResponse.public_id}`,
          JSON.stringify({ userid, image_path: link, uploaded_on: new Date() }),
        ),
        pool.query(`UPDATE users SET avatar = $1 WHERE user_id = $2`, [
          link,
          userid,
        ]),
      ]);

      await getUserData(userid, true);
      return res.json({ response: link }); // Return Cloudinary profile link
    } catch (error) {
      console.error(error);
      return res.status(500).json({ response: error });
    }
  },
);

module.exports = router;
