import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
 const userSchema =  new Schema(
    {
      
          username: {
            type : String,
            required: [true, 'Username is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // searching purpose (improves query performance)
        },
          email: {
            type : String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
          fullname: {
            type : String,
            required: true,
            trim: true,
            index: true, // searching purpose (improves query performance)
        },
          avatar: {
            type : String, //cloudinary url
            required: true,
        },
          coverimage: {
            type : String, //cloudinary url
        },
        watchhistory: [
            {
               type: Schema.Types.ObjectId,
               ref: 'Video' // Reference to the Video model
            }
            
        ],
        password: {
            type : String,
            required: [true ,`Password is required`],
        },
        refreshToken: {
            type : String,
            default: null,
        }

      


 },
     {
             timestamps: true, // Automatically manage createdAt and updatedAt fields
        }
)
// uaing hook pre () to hash the password before saving  [hook defines as a function that runs before the save operation]

// middleware function to hash the password before saving
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next() // If the password is not modified, skip hashing
    // If the password is modified, hash it
    this.password = await bcrypt.hash(this.password,10) // Hash the password with a salt rounds of 10
    next() // Call the next middleware function
})

// custom methods  to check password is correct
userSchema.methods.isPasswordCorrect = async function(Password){
   return await bcrypt.compare(Password,this.password) // Compare the provided password with the hashed password
    // If the passwords match, return true
}
// use jwt to generate access token

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {   //payload : above 
            _id : this._id, // User ID
            email:this.email, // User email
            username: this.username, // User username
            fullname: this.fullname, // User full name
        
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn:  process.env.ACCESS_TOKEN_EXPIRY // Token expiration time (1 day)
        }
    )
}
// use jwt to generate refresh token
userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
        {   
          _id : this._id, // User ID
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn:  process.env.REFRESH_TOKEN_EXPIRY // Token expiration time (7 days)
        }   
    )
}
 export  const  User = mongoose.model("User",userSchema)