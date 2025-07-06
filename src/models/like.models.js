import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
      default: null,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Ensure exactly ONE of tweet, video, or comment is liked
likeSchema.pre("save", function (next) {
  const targets = [this.tweet, this.video, this.comment].filter(Boolean);
  if (targets.length !== 1) {
    return next(
      new Error("Exactly one of tweet, video, or comment must be set in Like.")
    );
  }
  next();
});

export const Like = mongoose.model("Like", likeSchema);
