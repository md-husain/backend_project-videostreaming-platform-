import mongoose from "mongoose";
import { asynchandler } from "../utils/asynhandler.js";   
import  apiError  from "../utils/apierror.js";
import { Video } from "../models/video.model.js";
import {uploadonCloudinary} from "../utils/cloudinery.js";
import Apirsponse from "../utils/apiresponse.js";
import { v2 as cloudinary } from "cloudinary";
// 1. to get all videos .
const extract_all_videos = asynchandler(async (req,res) =>{
      const { page = 1,
         limit = 10,
         query="",
         sortBy = "createdAt",
         sortType = "desc",
         userid } 
            = req.query
      //TODO: get all videos based on query, sort, pagination

      //1. build dynamic filter object(to get data from database)
      const filter_object = {}

      //2. if(user send search query) then
      if(!query){
        throw new apiError(400,"Please make a search query")
      }
      if(query){
        filter_object.$or = [
            {
                title:
                {
                   $regex:query,
                   $options:"i"
                },
                description:
                {
                     $regex:query,
                     $options:"i"
                }

            }
        ]
      }

      //3 if user id diya gaya he toh us user ko video chaiye
    //   if(!userid){
    //     throw new apiError(400,"Invalid user request")
    //   }
       if(!userid){
        filter_object.owner = userid
      }
      

      //4 pagination ke liye skip aur limit calculate krnege
      const skip = (Number(page) -1)*Number(limit) // yeh bata rha konse item se suru

      // 5 sort object 
      const sort  = {
        [sortType]: sortType === "asc" ?  1:-1
      }
    // filter ke according videos ko db se fetch krna he
    const videos = await Video.find(filter_object)
    .sort(sort) // sort kr diya
    .skip(skip) // kitne doc ko skip krna he
    .limit(Number(limit))  // kinte doc chaiye
    .populate("owner","username","avatar") // kya kya info laana he
    .exec() // query excute

    // total matching videos count krni he
    const total_videos = await Video.countDocuments(filter_object)

    // final response display krna he
    return res
    .status(200)
    .json(
        new Apirsponse(
            200,
            { 
             total: total_videos, // total matching videos
             page: Number(page),  // current page
             limit:Number(limit), // limit per page
             videos                // actual video list
            },"Videos fetched successfully" // success message
            ) 
    )

})
 //

// 2. Publush a video on platform
const Upload_videos = asynchandler(async (req,res) =>{
     const { title, description} = req.body
     // validate require fields
     if(!title || !description){
        throw new apiError(400, "Title and description are required")
     }
    // Get file path from multer and then upload
    const videoloaclpath = req.files?.videofile?.[0]?.path
    const thumbnaillocalpath = req.files?.thumbnail?.[0].path
    if(!videoloaclpath || !thumbnaillocalpath){
        throw new apiError(400, "Video file and thumbnail are required")
     }

     // Upload video to cloudinary 
     const uploadedvideo = await uploadonCloudinary(videoloaclpath)
     if(!uploadedvideo?.url){
        throw new apiError(500,"Failed to upload video to Cloudinary")
     }

     // Upload thumbnail to cloudinary 
     const uploadedthumbnail = await uploadonCloudinary(thumbnaillocalpath)
     if(!uploadedthumbnail?.url){
        throw new apiError(500,"Failed to upload thumbnail to Cloudinary")
     }
     // provide a dummy duration
      const dummyDuration = 60;
     // save video info to database
     const newVideo = await Video.create({
        title,
        description,
        videofile:uploadedvideo.url,
        video_public_id: uploadedvideo.public_id,
        thumbnail:uploadedthumbnail.url,
        thumbnail_public_id: uploadedthumbnail.public_id,
        duration:dummyDuration,
        owner:req.user._id
     })

     // return success response on saving video
     return res
           .status(200)
           .json(
            new Apirsponse(
                     201,
                   newVideo,
               "Video uploaded successfully"
    )
)
})

// 3. get video by their corressponing _id
const extract_videobyid = asynchandler(async (req,res) =>{
     const { videoid } = req.params
     // validate the user 
     if(!videoid){
        throw new apiError(400,"Video Id is missing")
     }
     // check if video id is valid mongodb object
     if(!mongoose.Types.ObjectId.isValid(videoid)){
        throw new apiError(400,"Invalid Video Id")
     }

     // find video by id of video
    //  const video = await Video.findById(videoid)
    //  .populate("owner","username","avatar")
    //  .exec()
    const video  = await Video.findOne({
        $or:[
            {_id:videoid},
            {slug:videoid},
            {title: {$regex:videoid , $options:"i"} }
        ]
    })

     if (!video) {
        throw new apiError(404, "Video not found");
    }
    // return the video as an response
    return res  
         .status(200)
         .json(new Apirsponse (200,video,"Video fetched successfully"))
})

// 4. update uploaded video in platform
const update_video = asynchandler(async (req,res) =>{
     const { videoid } = req.params
     const { title , description} = req.body
     
     // Step 1: Validate video ID
  if (!videoid) {
    throw new apiError(400, "Video ID is missing in the request")
  }
  // fetch existing video which going to be update
 const video =   await Video.findById(videoid)
  if (!video) {
    throw new apiError(404, "Video not found")
  }

  // check a valid owner can only update video (ownership)
  if(video.owner.toString() !== req.user._id.toString()){
       throw new apiError(403, "You are not authorized to update this video")
  }

  // prepare the update object
  const updateobj = {}

  if(title)updateobj.title = title
  if(description)updateobj.description = description

  // also check thumbnail is updated 
  const thumbnailpath = req.files?.thumbnail?.[0]?.path
  if(thumbnailpath){
    const thumbnailupload = await uploadonCloudinary(thumbnailpath)
    if(!thumbnailupload?.url) {
      throw new apiError(500, "Thumbnail upload failed")
    }
    updateobj.thumbnail = thumbnailupload.url
  }

  // update the video file in cloudinary
  const videopath = req.filles?.videofile?.[0]?.path
    if(videopath){
    const videolupload = await uploadonCloudinary(videopath)
    if(!videolupload?.url) {
      throw new apiError(500, "Thumbnail upload failed")
    }
    updateobj.videofile = videolupload.url
  }

  // perform updation process
  const updated_video = await Video.findByIdAndUpdate(
    videoid,
    {
        $set:updateobj
    },
    {
        new : true
    }
  )
   // return response of videoupdation
    return res
    .status(200)
    .json(new Apirsponse(200, updated_video, "Video updated successfully"))
})

// 5. Delete the uploaded video from the platform
const Delete_video = asynchandler(async (req,res) =>{
     const { videoid } = req.params

      // Step 1: Validate video ID
  if (!videoid) {
    throw new apiError(400, "Video ID is required")
  }

   // Step 2: Find the video in the database
  const video = await Video.findById(videoid);
  if (!video) {
    throw new apiError(404, "Video not found")
  }

    // Step 3: Ensure the logged-in user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You are not authorized to delete this video");
  }
   // Step 4: Delete the video
  await Video.findByIdAndDelete(videoid)
  
  // step 5 delete from cloudinary
  if(video.video_public_id){
    await cloudinary.uploader.destroy(video.video_public_id,{resource_type:"video"})
  }
   if(video.thumbnail_public_id){
    await cloudinary.uploader.destroy(video.thumbnail_public_id,{resource_type:"video"})
  }
  // Step 6: Send response
  return res.status(200).json(
    new Apirsponse(200, {}, "Video deleted successfully")
  )
})

// 6.toggle the owner status
const toggle_public_status = asynchandler(async (req,res) =>{
     const { videoId } = req.params
     // Find the video by ID
     const video = await Video.findById(videoId)
      if (!video) {
        throw new apiError(404, "Video not found");
    }
   // flip the publish video flag
    video.ispublic = !video.ispublic

    // save the updated video after flip
    await video.save({validateBeforeSave : false})

    // send the updated response
    return res
         .status(200)
         .json(200,
            video,
            `Video has been ${video.ispublic ?"public":"private"} successfully`
         )

})

export {
    extract_all_videos,
    Upload_videos,
    extract_videobyid,
    update_video,
    Delete_video,
    toggle_public_status
}