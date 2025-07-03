import mongoose,{Schema} from "mongoose";


const Playlistschema =  new Schema(
    {
      name:{
        type:String,
        required:true
      },
      description:{
        type:String,
        required:true
      },
      videos: [
        {
        type:Schema.Types.ObjectId,
        ref:"Video"
      }
      ],
      owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
      }
    },
    {
      Timestamp:true
    }
)

export const Playlist = mongoose.model("Playlist",Playlistschema)