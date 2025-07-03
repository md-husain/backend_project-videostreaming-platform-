import mongoose from "mongoose";
import { asynchandler } from "../utils/asynhandler.js";   
import  apiError  from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import Apirsponse from "../utils/apiresponse.js";
import jwt from "jsonwebtoken"; 

//1. extract the user ke videos comments.
const Extract_vedio_comments = asynchandler(async (req, res) => {
    const { videoid } = req.params
    const { page = 1 , limit  = 10 } = req.query
    if(!videoid){
        throw new apiError(400, "Video ID is required")
    }

    // validate if object id valid or not
    if(!mongoose.Types.ObjectId.isValid(videoid)){
        throw new apiError(400, "Invalid video ID format")
    }

    // Aggregate comments with owner info
    const aggregate_query = Comment.aggregate([
        {
            $match:{
                video : new mongoose.Types.ObjectId(videoid)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"video_owner"
            }
        },
        {
            $unwind: "$video_owner"
        },
        {
            $project:{
                _id:"1",
                content:1,
                CreatedAt:1,
                "video_owner._id":1,
                "video_owner.name":1,
                "video_owner.avatar":1
            }
        }
    ])
    // apply pagination plugin
    const options = {
        page:parseInt(page),
        limit:parseInt(limit)
    }

    const result = await Comment.aggregatePaginate(aggregate_query,options)

    // return result
   res.status(200).json(new Apirsponse(200,{
        totalComments:result.totalDocs,
        totalPages:result.totalPages,
        currentPage:result.page,
        comments:result.docs

   }, "Video comments fetched successfully"
))
   
})

//2.  add the  comments.
const Comment_addtion = asynchandler(async (req, res) => {
    const {videoid , content} = req.body
    const userid = req.user._id

    // Step 1: Validate
      if (!videoid || !content || content.trim() === "") {
          throw new apiError(400, "Video ID and comment content are required");
         }

    // validate objectid
     if (!mongoose.Types.ObjectId.isValid(videoid)) {
         throw new apiError(400, "Invalid video ID format");
      }

     try {
         // create the comment 
         const newcomment = await Comment.create({
           content,
           video:videoid,
           owner:userid
         })
   
         // response 
          res.status(201).json(
                  new Apirsponse(201, newcomment, "Comment posted successfully")
           )
     } catch (error) {
         throw new apiError(500, "Failed to add comment",error?.message);
        
     }
})

//3. updates the existing  comments.
const Comment_updation = asynchandler(async (req, res) => {
    const { Commentid} = req.params
    const {content} = req.body
    const userid  = req.user._id

      // Step 1: Validation
        if (!Commentid || !mongoose.Types.ObjectId.isValid(Commentid)) {
               throw new apiError(400, "Invalid comment ID");
        }
        if (!content || content.trim() === "") {
           throw new apiError(400, "Comment content cannot be empty");
        }
        
        // find the existing comment
        const comment = await Comment.findById(Commentid)
        if(!comment){
            throw new apiError(404, "Comment  cannot be found");
        }
        //  Check if user is owner
        if (comment.owner.toString() !== userid.toString()) {
               throw new apiError(403, "You are not authorized to update this comment");
        }

        // update and the new comment
        comment.content = content
        await comment.save()

        res.status(200).json(
             new Apirsponse(200, comment, "Comment updated successfully")
        )


})

//4. Delete the existing  comments.
const Comment_deletion = asynchandler(async (req, res) => {
    const { commentid } = req.params;
     const userid = req.user._id;

            // Step 1: Validate the comment ID
        if (!commentid || !mongoose.Types.ObjectId.isValid(commentid)) {
               throw new apiError(400, "Invalid comment ID");
            }

            // Step 2: Find the comment
            const comment = await Comment.findById(commentid);
        if (!comment) {
            throw new apiError(404, "Comment not found");
            }

            // Step 3: Check ownership
         if (comment.owner.toString() !== userid.toString()) {
            throw new apiError(403, "You are not authorized to delete this comment");
            }

            // Step 4: Delete the comment
          await comment.deleteOne();

            // Step 5: Send response
         res.status(200).json(
            new Apirsponse(200, comment, "Comment deleted successfully")
            );
})
export {
    Extract_vedio_comments,
    Comment_addtion,
    Comment_updation,
    Comment_deletion
}
// 📌 What is Pagination?

// Pagination ka matlab hai:

// "Saare data ko ek hi baar mein bhejne ke bajaye, thoda thoda karke pages mein divide karke bhejna."