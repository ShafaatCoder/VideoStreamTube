// src/controllers/video.controller.js

import { isValidObjectId } from "mongoose";
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

  let duration;
  try {
    duration = await getVideoDuration(videoFilePath);
    duration = Math.floor(duration);
  } catch (error) {
    throw new ApiError(500, "Could not extract video duration");
  }

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

  // Clean up temp files (optional)
  import("fs/promises").then((fs) => {
    fs.unlink(videoFilePath).catch(() => {});
    fs.unlink(thumbnailPath).catch(() => {});
  });

  return res.status(200).json({
    message: "Video uploaded successfully!",
    video: newVideo,
  });
});

const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find video by ID and populate owner details if needed
  const video = await Video.findById(id).populate("owner", "username email");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json({
    message: "Video fetched successfully!",
    video,
  });
});

const updateVideo = asyncHandler(async (req, res) => {
  const { id: videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // ✅ Update text fields
  if (title) video.title = title;
  if (description) video.description = description;

  // ✅ Handle thumbnail file upload
  if (req.file) {
    const uploadedThumbnail = await uploadOnCloudinary(req.file.path, "image");
    if (!uploadedThumbnail?.url) {
      throw new ApiError(500, "Failed to upload new thumbnail");
    }
    video.thumbnail = uploadedThumbnail.url;
  }

  await video.save();

  return res.status(200).json({
    message: "Video updated successfully!",
    video,
  });
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { id: videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }
  const video = await Video.findByIdAndDelete(
    videoId,
    { isDeleted: true },
    { new: true }
  );
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res.status(200).json({
    message: "Video Deleted Successfully",
    video,
  });
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  // 1. Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // 2. Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 3. Check if the user owns the video
  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to change this video's status"
    );
  }

  // 4. Toggle publish status
  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json({
    message: `Video has been ${
      video.isPublished ? "published" : "unpublished"
    }`,
    isPublished: video.isPublished,
  });
});

const getAllVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User");
  }
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Fetch total count
  const totalVideos = await Video.countDocuments({ owner: userId });

  // Fetch paginated videos
  const videos = await Video.find({ owner: userId })
    .sort({ createdAt: -1 }) // newest first
    .skip(skip)
    .limit(limitNum);

  return res.status(200).json({
    message: "Videos fetched successfully",
    data: {
      videos,
      currentPage: pageNum,
      totalPages: Math.ceil(totalVideos / limitNum),
      totalVideos,
    },
  });
});

export const videoController = {
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getAllVideos,
};
// ...existing code...
