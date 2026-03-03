import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Ensure env is loaded before configuring Cloudinary
dotenv.config();

const {
  CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER_PREFIX,
} = process.env;

// Prefer standard CLOUDINARY_URL if present, otherwise use discrete vars
if (CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

if (!cloudinary.config().api_key || !cloudinary.config().api_secret) {
  console.warn("Cloudinary credentials are missing; media uploads will fail until they are provided.");
}

export const cloudinaryClient = cloudinary;
export const cloudinaryFolderPrefix = CLOUDINARY_FOLDER_PREFIX || "peerpicks";
