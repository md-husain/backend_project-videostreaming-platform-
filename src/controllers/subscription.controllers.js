import mongoose from "mongoose";
import { asynchandler } from "../utils/asynhandler.js";   
import  apiError  from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { subscription } from "../models/subscriber.model.js";
import Apirsponse from "../utils/apiresponse.js";
import jwt from "jsonwebtoken"; 

// various controllers includes are:

//1. toggle all the subscription
const toggleSubscription = asynchandler(async (req, res) => {
    const {channelid} = req.params
    // userid nikal lenge joh currnet login he auth. purpose ke liye
    const userid = req.user._id

  try {
      // check user already subs or not
      const exist_subs = await subscription.findOne(
          {
              subscriber: userid,
              channel: channelid
          }
      )
      if(exist_subs){
          // toh unsubs kr denge
          await subscription.findByIdAndDelete(exist_subs.id)
         return res.status(200).json(new Apirsponse(200, {}, "Successfully Unsubscribed"));
      }
      else{
          //toh subs kr denge exist_user ko channel se
          await subscription.create({
              subscriber:userid,
              channel:channelid
          })
          // return the successfull api response
         return res
              .status(200)
              .json(new Apirsponse(201, {}, "Successfully Subscribed"))
      }
  
  } catch (e) {
      throw new apiError(500,"Subscription toggle failed", e?.message)
  }
})

//2.controller to return subscriber list of a channel
const getUserChannelSubscribers = asynchandler(async (req, res) => {
    const {channelid} = req.params

   try {
     const subscribers = await subscription.aggregate([
         {
             $match:{
                 channel : new mongoose.Types.ObjectId(channelid)
                 //get channels
             }
         },
         {
             $lookup:{
                 // join users to chaanels
                 from:"users",
                 localField:"subscriber",
                 foreignField:"_id",
                 as:"subscriber_details"
             }
         },
         {
             // convert array of userdetails into object
                $unwind:"$subscriber_details"
         },
         {
             $project:{
                 _id:0,
                 userid:"$subscriber_details._id",
                 name:"$subscriber_details.name",
                 email:"$subscriber_details.email",
                 avatar:"$subscriber_details.avatar",
                 subscriberAt:"$createdAt",
                  // Hide sensitive fields explicitly
                "subscriber_details.password": 0,
                 "subscriber_details.refreshToken": 0,
                 "subscriber_details.accessToken": 0
             }
         }
     ])
     
     // send safe response 
     res.status(200).json({
         total:subscribers.length,
         subscribers
     })
   } catch (e) {
    throw new apiError(500, "Failed to fetch subscribers", e?.message)
   }
})

//3. controller to return channel list to which user has subscribed
const getSubscribedChannels = asynchandler(async (req, res) => {
    const { subscriberid } = req.params

    // matches the channels subs by the user
   try {
     const subscribed_channels = await subscription.aggregate([
         {
             $match:{
                 subscriber: new mongoose.Types.ObjectId(subscriberid)
             }
         },
         {
             $lookup:{
                 from:"users",
                 localField:"channel",
                 foreignField:"_id",
                 as:"channeldetails"
             }
         },
         {
             $unwind:"$channeldetails"
         },
         {
             $project:
             {
                 _id:0,
             channelid:"$channeldetails._id",
             name:"$channeldetails.name",
             email:"$channeldetails.email",
             avatar:"$channeldetails.avatar",
             subscribedAt: "$createdAt",
              // Hide sensitive fields explicitly
                 "channeldetails.password": 0,
                 "channeldetails.refreshToken": 0,
                 "channeldetails.accessToken": 0
             }
         }
     ])
      // send safe response 
     res.status(200).json({
         total:subscribed_channels.length,
         channels:subscribed_channels
     })
   } catch (e) {
    throw new apiError(500, "Failed to fetch subscribed channels", e?.message);
    
   }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
