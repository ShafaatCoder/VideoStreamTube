import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get channel statistics
const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const [totalVideos, totalSubscribers, totalLikes, totalViewsAgg] =
    await Promise.all([
      Video.countDocuments({ owner: channelId }),
      Subscription.countDocuments({ channel: channelId }),
      Like.countDocuments({ channel: channelId }),
      Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]),
    ]);

  const totalViews = totalViewsAgg[0]?.totalViews || 0;

  return res.status(200).json(
    new ApiResponse({
      message: "Channel stats fetched successfully",
      data: {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews,
      },
    })
  );
});

// Get videos uploaded by a specific channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalVideos = await Video.countDocuments({ owner: channelId });

  return res.status(200).json(
    new ApiResponse({
      message: "Channel videos fetched successfully",
      data: {
        videos,
        totalVideos,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / limit),
      },
    })
  );
});

export { getChannelStats, getChannelVideos };
