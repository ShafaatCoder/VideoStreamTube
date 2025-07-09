import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();
  } else {
    // Like
    await Like.create({
      video: videoId,
      likedBy: userId,
    });
  }

  // Get updated like count
  const likeCount = await Like.countDocuments({ video: videoId });

  return res.status(200).json({
    message: existingLike ? "Video unliked" : "Video liked",
    likeCount,
  });
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: userId, // ✅ fixed typo
    });
  }

  const likeCount = await Like.countDocuments({ tweet: tweetId });

  return res.status(200).json({
    message: existingLike ? "Tweet unliked" : "Tweet liked",
    likeCount,
  });
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
  } else {
    await Like.create({
      comment: commentId,
      likedBy: userId,
    });
  }

  const likeCount = await Like.countDocuments({ comment: commentId });

  return res.status(200).json({
    message: existingLike ? "Comment unliked" : "Comment liked",
    likeCount,
  });
});

import { ApiResponse } from "../utils/ApiResponse.js";

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Step 1: Get all liked videos for this user
  const likes = await Like.find({ likedBy: userId, video: { $exists: true } })
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "username email",
      },
    })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  // Step 2: Filter out cases where video is deleted
  const likedVideos = likes
    .map((like) => like.video)
    .filter((video) => video !== null); // skip deleted videos

  const totalLikes = await Like.countDocuments({
    likedBy: userId,
    video: { $exists: true },
  });

  return res.status(200).json(
    new ApiResponse({
      message: "Liked videos fetched successfully",
      data: {
        likedVideos,
        totalLikes,
        currentPage: pageNum,
        totalPages: Math.ceil(totalLikes / limitNum),
      },
    })
  );
});

export const likeController = {
  toggleVideoLike,
  toggleTweetLike,
  toggleCommentLike,
  getLikedVideos,
};
