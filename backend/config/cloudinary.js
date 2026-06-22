const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const cloudName = process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.API_SECRET || process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

cloudinary.isConfigured = isCloudinaryConfigured;

module.exports = cloudinary;
