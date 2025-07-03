import mongoose from "mongoose";

const LikeVideoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "video",
    required: true
  }
}, { timestamps: true });

LikeVideoSchema.index({ user: 1, video: 1 }, { unique: true });

export const LikeVideo = mongoose.model("LikeVideo", LikeVideoSchema);
