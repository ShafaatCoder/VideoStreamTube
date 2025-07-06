import { isValidObjectId } from "mongoose";
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

export const likeController = {
  toggleVideoLike,
  toggleTweetLike,
};
