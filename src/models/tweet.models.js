import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Tweet content is required"],
      trim: true,
      maxlength: 280, // optional: like Twitter's character limit
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tweet owner is required"],
    },
    // optional future additions
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    media: [String], // for images/videos later
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
