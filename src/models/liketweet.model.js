import mongoose from "mongoose";

const LikeTweetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  tweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tweet",
    required: true
  }
}, { timestamps: true });

LikeTweetSchema.index({ user: 1, tweet: 1 }, { unique: true }); // prevent duplicate likes

export const LikeTweet = mongoose.model("LikeTweet", LikeTweetSchema);
