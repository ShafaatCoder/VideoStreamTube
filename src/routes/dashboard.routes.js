import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();
router.use(verifyJWT);
// routes/channel.routes.js
router.get("/channel/:channelId/stats", getChannelStats);
router.get("/channel/:channelId/videos", getChannelVideos);
export default Router;
