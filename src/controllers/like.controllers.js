import mongoose from "mongoose";
import { asynchandler } from "../utils/asynhandler.js";   
import  apiError  from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.models.js";
import { LikeVideo } from "../models/likevideo.model.js";
import { Comment } from "../models/comment.model.js";
import { LikeComment } from "../models/likecomment.mode.js";
import { Tweet } from "../models/tweets.model.js";
import { LikeTweet } from "../models/liketweet.model.js";

import Apirsponse from "../utils/apiresponse.js";
import jwt from "jsonwebtoken"; 

//1. Toggle/display the like videos
const toggle_liked_video = asynchandler(async (req, res) => {
    const { videoid } = req.body
    const userid = req.user._id

    if (!videoid) {
    throw new apiError(400, "Video ID is required");
  }

  // check like is already exist 
    const existingLike = await LikeVideo.findOne({ user: userid, video: videoid })
    if(existingLike){
        // If already liked, remove it (unlike)
        await Like.findByIdAndDelete(existingLike._id)

         return res.status(200).json(
      new Apirsponse(200, {}, "Video unliked successfully")
    )
    }
    else{
         // If not liked, create a new like
         await Like.create({user:userid,video:videoid})

      return res.status(200).json(
      new Apirsponse(201, {}, "Video liked successfully")
    )
    }

})

//2.  Toggle/display the like comment
const toggle_liked_comment = asynchandler(async (req, res) => {
 const { commentid } = req.params;
  const userid = req.user._id;

  if (!commentid) {
    throw new apiError(400, "Comment ID is required");
  }

  // Check if comment exists
  const comment = await Comment.findById(commentid);
  if (!comment) {
    throw new apiError(404, "Comment not found");
  }

  // Check if user already liked
  const liked = await LikeComment.findOne({ user: userid, comment: commentid });

  if (liked) {
    // Unlike
    await LikeComment.findByIdAndDelete(liked._id);
    return res.status(200).json(
      new Apirsponse(200, {}, "Comment unliked successfully")
    );
  } else {
    // Like
    await LikeComment.create({ user: userid, comment: commentid });
    return res.status(201).json(
      new Apirsponse(201, {}, "Comment liked successfully")
    )
  }
 })

//3. extract the user fav playlist by their id.
const toggle_liked_tweet = asynchandler(async (req, res) => {
   const { tweetid } = req.params;
  const userid = req.user._id;

  // 1. Validate tweet
  const tweet = await Tweet.findById(tweetid);
  if (!tweet) {
    throw new apiError(404, "Tweet not found");
  }

  // 2. Check if user already liked
  const liked = await LikeTweet.findOne({ user: userid, tweet: tweetid });

  if (liked) {
    // 3. Unlike
    await LikeTweet.findByIdAndDelete(liked._id);
    await Tweet.findByIdAndUpdate(tweetid, { $inc: { likeCount: -1 } });

    return res.status(200).json(
      new Apirsponse(200, {}, "Tweet unliked successfully")
    );
  } else {
    // 4. Like
    await LikeTweet.create({ user: userid, tweet: tweetid });
    await Tweet.findByIdAndUpdate(tweetid, { $inc: { likeCount: 1 } });

    return res.status(201).json(
      new Apirsponse(201, {}, "Tweet liked successfully")
    );
  }
})


//4. extract like videos
const get_liked_vidoes = asynchandler(async (req, res) => {
     const userid = req.user._id

     // Fetch liked videos by the user
     const liked  = await LikeVideo.find({user:userid})
        .populate({
            path:"video",
            populate:{
                path:"owner",
                select:"name avatar"
            }
        })
        .sort({createdAt:-1})
     const likedVideos = liked.map(item => item.video).filter(Boolean);

  res.status(200).json(
    new Apirsponse(200, {
      total: likedVideos.length,
      videos: likedVideos
    }, "Liked videos fetched successfully")
  );
})
export {
    toggle_liked_video,
    toggle_liked_comment,
    toggle_liked_tweet,
    get_liked_vidoes
}
