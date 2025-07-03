import mongoose , {Aggregate, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const VideoSchema =  new Schema(
    {
        videofile:{
            type: String, // URL of the video file stored in a cloud service (cloudinary)
            required: true,
        },
        thumbnail:{
            type: String, // URL of the thumbnail image stored in a cloud service (cloudinary)
            required: true,
        },
        title:{
            type: String,
            required: [true, 'Title is required'],
        },
         description:{
            type: String,
            required: [true, ' required'],
        },
         duration:{
            type: Number, // Duration of the video in seconds
            required: [true, 'time is required'],
        },
        views:{
            type: Number, // Number of views the video has received
            default: 0, // Default value is 0
        },
        ispublic:{
            type: Boolean, // Whether the video is public or private
            default: true, // Default value is true (public)
        },
        owner:{
            type: Schema.Types.ObjectId, // Reference to the User model
            ref: 'User', // The model name to reference
            required: true, // Owner is required
        },
        video_public_id: {type:String},
        thumbnail_public_id: {type:String}


}
,
{
    timestamps: true, // Automatically manage createdAt and updatedAt fields
}
)
VideoSchema.plugin(mongooseAggregatePaginate) // Add pagination plugin to the schema(for aggregate queries)


//_zJDc0crGs_viIwJNJutC2OxSMk
export const Video = mongoose.model("Video", VideoSchema)