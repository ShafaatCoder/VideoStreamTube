import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const owner = req.user._id; // OR req.user.id based on your auth

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Content is required" });
  }

  const tweet = await Tweet.create({ content, owner });

  const populatedTweet = await Tweet.findById(tweet._id).populate(
    "owner",
    "username"
  );

  res.status(201).json({
    message: "Tweet created successfully",
    tweet: populatedTweet,
  });
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const tweets = await Tweet.find({ owner: userId }).populate(
    "owner",
    "username"
  );

  res.status(200).json({
    message: "User tweets fetched successfully",
    tweets,
  });
});

const updateTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Content is required" });
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true, runValidators: true }
  );
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  res.status(200).json({
    message: "Tweet updated successfully",
    tweet,
  });
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  const tweet = await Tweet.findByIdAndDelete(
    tweetId,
    { isDeleted: true },
    { new: true }
  );
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  res.status(200).json({
    message: "Tweet deleted Successfully",
    tweet,
  });
});

export const tweetController = {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};
