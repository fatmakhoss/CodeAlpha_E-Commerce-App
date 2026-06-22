const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!cloudinary.isConfigured) {
        return res.status(500).json({
          success: false,
          message: "Cloudinary is not configured. Check CLOUD_NAME, API_KEY, and API_SECRET in backend/.env.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required.",
        });
      }

      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "products",
        }
      );

      res.json({
        success: true,
        imageUrl: result.secure_url,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
