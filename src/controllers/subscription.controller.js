import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Toggle subscription (subscribe/unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (channelId === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();
    return res.status(200).json(
      new ApiResponse({
        message: "Unsubscribed successfully",
        data: null,
      })
    );
  } else {
    await Subscription.create({
      channel: channelId,
      subscriber: subscriberId,
    });

    return res.status(201).json(
      new ApiResponse({
        message: "Subscribed successfully",
        data: null,
      })
    );
  }
});

// ✅ Get all subscribers for a given channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "username email avatar"
  );

  const totalSubscribers = subscribers.length;

  return res.status(200).json(
    new ApiResponse({
      message: "Channel subscribers fetched successfully",
      data: {
        subscribers,
        totalSubscribers,
      },
    })
  );
});

// ✅ Get channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;

  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username email avatar");

  const totalChannels = subscriptions.length;

  return res.status(200).json(
    new ApiResponse({
      message: "Subscribed channels fetched successfully",
      data: {
        channels: subscriptions.map((sub) => sub.channel),
        totalChannels,
      },
    })
  );
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };
