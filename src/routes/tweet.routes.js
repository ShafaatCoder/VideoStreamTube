import { Router } from "express";
import { tweetController } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);
// Create a new tweet
router.route("/create-tweet").post(tweetController.createTweet);
// Get tweets by user ID
router.route("/user-tweets/:userId").get(tweetController.getUserTweets);
//Update a tweet
router.route("/update-tweet/:tweetId").patch(tweetController.updateTweet);
//delete a tweet
router.route("/delete-tweet/:tweetId").delete(tweetController.deleteTweet);

export default router;
