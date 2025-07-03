import { asynchandler } from "../utils/asynhandler.js";
import apiError from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const  verifyJWT = asynchandler(async (req,_,next) =>{
        // Check if the request has an authorization header
       try {
        const token =  req.cookies?.accesstoken || req.header("Authorization") ?. replace("Bearer ", "") 
 
        if(!token){
         throw new apiError(401, "Access token is required for authentication")
        }
        
       const decodetoken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
       const user = await User.findById(decodetoken._id).select("-password -refreshToken") // Exclude password and refreshToken from the response
 
         if(!user){
             throw new apiError(401, "User not found")
         }
 
         req.user = user; // Attach the user object to the request for further use
         next(); // Call the next middleware or route handler
       } catch (e) {
        throw new apiError(401, e.message || "Unauthorized access, invaild  axcess token")
       }
})