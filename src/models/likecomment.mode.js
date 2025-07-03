import mongoose from "mongoose";

const LikeCommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment",
    required: true
  }
}, { timestamps: true });

LikeCommentSchema.index({ user: 1, comment: 1 }, { unique: true });

export const LikeComment = mongoose.model("LikeComment", LikeCommentSchema);
