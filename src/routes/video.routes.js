import { Router } from "express";
import { videoController } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/video/upload-a-video").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  videoController.uploadVideo
);

router.route("/video/:id").get(verifyJWT, videoController.getVideoById);
router
  .route("/video/update-video/:id")
  .patch(verifyJWT, upload.single("thumbnail"), videoController.updateVideo);
router
  .route("/video/delete-video/:id")
  .delete(verifyJWT, videoController.deleteVideo);
export default router;
