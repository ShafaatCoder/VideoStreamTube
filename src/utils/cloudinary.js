import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config(); // Load .env file

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Function
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("✅ File uploaded successfully:", response.url);

    fs.unlinkSync(localFilePath); // Delete local file
    return response.url;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // Clean up on failure
    }
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
    console.log("✅ File deleted successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Deletion failed:", error.message);
    return null;
  }
};

export { deleteFromCloudinary, uploadOnCloudinary };
