import mongoose from "mongoose";
import { asynchandler } from "../utils/asynhandler.js";   
import  apiError  from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweets.model.js";
import Apirsponse from "../utils/apiresponse.js";
import jwt from "jsonwebtoken"; 

//1. create the user tweetsAllow a logged-in user to create a tweet with some text (and maybe image/video if you extend it later)..
const Tweet_creation = asynchandler(async (req, res) => {
    const { content } = req.body
    const userid = req.user._id // 2. Get tweet content from body

 /* improve-  You can later extend this to support image/video upload using Cloudinary.
You can also add tags, likes, replies, etc.
You can populate user info in future queries (using .populate("postedBy")).
Want me to:
Add image/video support?
Add Tweet list controller (pagination)?
Add replies or like controller?*/


    // validate the content 
    if(!content || content.trim() === ""){
        throw new apiError(400,"Tweet content cannot be empty")
    }
    try {
        // create the tweet 
        const tweet = await Tweet.create({
            content,
            postedBy:userid
        })

        // return the success response
        res.status(201).json(
            new Apirsponse(201,tweet,"Tweet created successfully")
        )
        
    } catch (e) {
        throw new apiError(500, "Failed to create tweet", e?.message);
    }
})

//2. updates the existing tweets.
const Tweet_updation = asynchandler(async (req, res) => {
    // extract tweet by id and new content
    const { tweetid } = req.params
    const { content }  = req.body
    const userid = req.user._id

    // Validate the exist tweet content
    if (!content || content.trim() === "") {
    throw new apiError(400, "Tweet content cannot be empty")
  }

  // find the tweet to be modified
  const tweet = await Tweet.findById(tweetid)
  if(!tweet){
     throw new apiError(404, "Tweet not found")
  }

  // check if login user is valid tweet user
 if(tweet.postedBy.toString() !== userid.toString()){
     throw new apiError(403, "You are not allowed to update the tweet")
  }
  // update the tweet 
  tweet.content = content
  await tweet.save()

  //  Send response
  res.status(200).json(
    new Apirsponse(200, tweet, "Tweet updated successfully"))

})


//3. Delete the existing tweets.
const deleteTweet = asynchandler(async (req, res) => {
    // extract tweet by id
    const { tweetid } = req.params
    const userid = req.user._id

     // find the tweet to be delete
  const tweet = await Tweet.findById(tweetid)
  if(!tweet){
     throw new apiError(404, "Tweet not found")
  }

   // check if login user is valid tweet user
  if(tweet.postedBy.toString() !== userid.toString()){
     throw new apiError(403, "You are not allowed to update the tweet")
  }
// delete the existing tweet
  await tweet.deleteOne()
 //  Send response
  res.status(200).json(
    new Apirsponse(200, tweet, "Tweet delete successfully"))

})
//4 get user tweets 
const getUserTweet = asynchandler(async (req, res) => {
   const { userid } = req.params

   try {
     // finad all tweet by the gievn user
     const tweets = await Tweet
     .find({postedBy:userid})
        .sort({createdAt:-1})
        .populate("postedBy", "name avatar")

    //2. If no tweets, you can optionally throw 404 or return empty
    if (tweets.length === 0) {
      throw new apiError(404, "No tweets found for this user");
    }
    
     // 3. Send response
    res.status(200).json(
      new Apirsponse(200, { total: tweets.length, tweets }, "User tweets fetched successfully")
    )
   } catch (error) {
    throw new apiError(500,"Failed to Fetched the user Tweets")
   }
})
export {
    Tweet_creation,
    Tweet_updation,
    deleteTweet,
    getUserTweet
}
