import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/comment/:videoId").post(verifyJWT, commentController.addComment);
router
  .route("/comment/update-comment/:videoId/:commentId")
  .patch(verifyJWT, commentController.updateComment);

router
  .route("/comment/delete-comment/:videoId/:commentId")
  .delete(verifyJWT, commentController.deleteComment);

router
  .route("/comment/get-comment/:videoId/:commentId")
  .get(verifyJWT, commentController.getComment);

router
  .route("/comment/video-comments/:videoId")
  .get(verifyJWT, commentController.getVideoComments);

export default router;
