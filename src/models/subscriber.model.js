import mongoose,{ Schema} from "mongoose";


const subscriberSchema = new Schema({
    subscriber: {
          type: Schema.Types.ObjectId,
          ref:"User"
    },
    channel:{
          type: Schema.Types.ObjectId,
          ref:"User"
    }
},{Timestamp:true})


export const subscription = mongoose.model("subscription",subscriberSchema)