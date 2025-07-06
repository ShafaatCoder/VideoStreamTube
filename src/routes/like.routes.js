import { Router } from "express";
import { likeController } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/like/:videoId").patch(verifyJWT, likeController.toggleVideoLike);
router.route("/like/:tweetId").patch(verifyJWT, likeController.toggleTweetLike);
export default router;
