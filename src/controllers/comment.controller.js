import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const videoId = req.params.videoId;
  const userId = req.user._id;

  // Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video was not found or Deleted.");
  }

  // Validate comment content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  return res.status(201).json(
    new ApiResponse({
      message: "Comment added successfully",
      data: comment,
    })
  );
});
const updateComment = asyncHandler(async (req, res) => {
  const { commentId, videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // Validate IDs
  if (!isValidObjectId(commentId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid comment or video ID");
  }

  // Validate updated content
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Updated content is required");
  }

  // Check if video still exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(
      404,
      "The video for this comment does not exist anymore."
    );
  }

  // Fetch and validate comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check comment belongs to that video
  if (comment.video.toString() !== videoId) {
    throw new ApiError(
      400,
      "This comment does not belong to the specified video"
    );
  }

  // Ownership check
  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  // Update content
  comment.content = content;
  await comment.save();

  return res.status(200).json(
    new ApiResponse({
      message: "Comment updated successfully",
      data: comment,
    })
  );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId, videoId } = req.params;
  const userId = req.user._id;

  // Validate IDs
  if (!isValidObjectId(commentId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid comment or video ID");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(
      404,
      "The video for this comment does not exist anymore."
    );
  }

  // Fetch comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if comment belongs to the video
  if (comment.video.toString() !== videoId) {
    throw new ApiError(
      400,
      "This comment does not belong to the specified video"
    );
  }

  // Check if user is the owner
  if (comment.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  // ✅ Delete comment
  await comment.deleteOne();

  return res.status(200).json(
    new ApiResponse({
      message: "Comment deleted successfully",
      data: comment,
    })
  );
});

const getComment = asyncHandler(async (req, res) => {
  const { videoId, commentId } = req.params;

  if (!isValidObjectId(videoId) || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid video or comment ID");
  }

  const comment = await Comment.findById(commentId).populate(
    "owner",
    "username email"
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.video.toString() !== videoId) {
    throw new ApiError(400, "Comment does not belong to the specified video");
  }

  return res.status(200).json(
    new ApiResponse({
      message: "Comment fetched successfully",
      data: comment,
    })
  );
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Optional: Ensure video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Convert to numbers (query params are strings)
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username email")
    .sort({ createdAt: -1 }) // latest first
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse({
      message: "Comments fetched successfully",
      data: {
        comments,
        totalComments,
        currentPage: pageNum,
        totalPages: Math.ceil(totalComments / limitNum),
      },
    })
  );
});

export const commentController = {
  addComment,
  updateComment,
  deleteComment,
  getComment,
  getVideoComments,
};
