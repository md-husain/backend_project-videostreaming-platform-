import mongoose , {Aggregate, plugin, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Import the pagination plugin for aggregate queries(comments numbers)


const CommentsSchema = new Schema(
    {
      content:{
          type:String,
          required:true
      },
      video:{
          type:Schema.Types.ObjectId, // Reference to the Video model
          ref:"video"
      },
      owner:{
          type:Schema.Types.ObjectId, // Reference to the user model
          ref:"user"
      }
},{timestamps:true}
)

CommentsSchema.plugin(mongooseAggregatePaginate); // Add pagination plugin to the schema(for aggregate queries)

export const Comment = mongoose.model("Comment", CommentsSchema) 