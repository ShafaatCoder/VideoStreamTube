import { Router } from "express";
import { likeController } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/like/video/:videoId").patch(likeController.toggleVideoLike);
router.route("/like/tweet/:tweetId").patch(likeController.toggleTweetLike);
router
  .route("/like/comment/:commentId")
  .patch(likeController.toggleCommentLike);
router.route("/like/liked-videos").get(likeController.getLikedVideos);
export default router;
