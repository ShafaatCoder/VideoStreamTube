// src/controllers/video.controller.js

import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { getVideoDuration } from "../utils/getVideoDuration.js"; // Make sure this path is correct

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;

  if (!title || !description) {
    throw new ApiError(400, "Title and Description are required");
  }

  const videoFilePath = req?.files?.video?.[0]?.path;
  const thumbnailPath = req?.files?.thumbnail?.[0]?.path;

  if (!videoFilePath || !thumbnailPath) {
    throw new ApiError(400, "Video and Thumbnail are required");
  }

  // ✅ Get duration BEFORE uploading and deleting local file
  const duration = await getVideoDuration(videoFilePath);
  if (!duration) {
    throw new ApiError(500, "Could not extract video duration");
  }

  // ✅ Upload to Cloudinary
  const uploadedVideo = await uploadOnCloudinary(videoFilePath, "video");
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath, "image");

  if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
  }

  const newVideo = await Video.create({
    owner: userId,
    title,
    description,
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    duration,
  });

  return res.status(200).json({
    message: "Video uploaded successfully!",
    video: newVideo,
  });
});

export const videoController = {
  uploadVideo,
};
