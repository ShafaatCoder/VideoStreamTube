import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// User subscribes/unsubscribes to a channel
router.patch("/subscription/:channelId", verifyJWT, toggleSubscription);

// Get all subscribers of a channel (can be used in profile or dashboard)
router.get(
  "/subscription/:channelId/subscribers",
  verifyJWT,
  getUserChannelSubscribers
);

// Get all channels the logged-in user has subscribed to
router.get(
  "/subscription/my-subscribed-channels",
  verifyJWT,
  getSubscribedChannels
);

export default router;
