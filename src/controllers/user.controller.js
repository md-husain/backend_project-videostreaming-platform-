import { asynchandler } from "../utils/asynhandler.js";   
import  apiError  from "../utils/apierror.js";
import { User } from "../models/user.model.js";
import {uploadonCloudinary} from "../utils/cloudinery.js";
import Apirsponse from "../utils/apiresponse.js";
import jwt from "jsonwebtoken"; 
import mongoose from "mongoose";
//import awt  from "../middlewares/auth.middleware.js";


// controller to handle access token and the asign the current session after 404
const refreshaccesstoken = asynchandler(async (req,res) =>{
    // get the income refresh token from the request
   const incomingrefreshtoken  = req.cookies.refreshtoken || req.body.refreshtoken || req.header("Authorization")?.replace("Bearer ", "")
    if(!incomingrefreshtoken){
        throw new apiError(401,"Invalid refresh token && unthorized access")
    }

    try {
        const decodetoken = jwt.verify(
            incomingrefreshtoken,
            process.env.REFRESH_TOKEN_SECRET
        )
        // refresh token from database
        const user = await User.findById(decodetoken?._id)
        if(!user){
            throw new apiError(401, "User not found while refreshing access token && invalid refresh token")
        }
    
        // check if the refresh token in the database matches the incoming refresh token
        if(incomingrefreshtoken !== user?.refreshtoken){
            throw new apiError(401, "refresh token is expired or used") 
        }
    
        // generate new access token and refresh token
        const {accesstoken, newrefreshtoken} = await genrateaccessandrefreshtoken(user._id)
    
        const cookieoptions = {
            httpOnly:true,
            secure:true
        }
    
        // return response with new access token and refresh token
        return res
            .status(200)
            .cookie("accesstoken",accesstoken,cookieoptions)
            .cookie("refreshtoken",newrefreshtoken,cookieoptions)
            .json(
                new Apirsponse(
                    200,
                    {
                        accesstoken, // New access token
                        refreshtoken: newrefreshtoken // New refresh token
                    },
                    "Access token refreshed successfully"
                )
            )
    } catch (e) {
        throw new apiError(401, e.message || "Invalid refresh token or unauthorized access")
        
    }

})
// a sep method to genrate access and refresh token(widely used in auth)
const genrateaccessandrefreshtoken = async (userid) =>{
    try {
        const user = await User.findById(userid)
          if (!user) {
            throw new apiError(404, "User not found while generating tokens");
        }
        const accesstoken = user.generateAccessToken() // Generate access token
        const refreshtoken = user.generateRefreshToken() // Generate refresh token

        // save refresh token to user document(database)
        user.refreshtoken = refreshtoken
        user.save({validateBeforeSave: false}) // Save the user document without validating the password again  


        // return both tokens
        return { accesstoken,refreshtoken}
        
    } catch (e) {
        throw new apiError(500, "Internal Server Error while generating tokens")
    }

}
const registeruser = asynchandler( async(req,res) =>{
    // res.status(200).json({
    //     message:"md ok"
    // })
    
    //1. Extract user data from request body
    const {fullname ,username,email , password}  =  req.body
    //console.log("User data:", fullname,username, email,password)

    //2. Validate user data
    if(
        [fullname, username, email].some((field) => field?.trim() === "")
    )
    {
       throw new apiError(400, "All fields are required")
    }

//     if (!fullname || fullname.trim() === "") {
//     throw new apiError(400, "Full name is required")
// } else if (!username || username.trim() === "") {
//     throw new apiError(400, "Username is required")
// } else if (!email || email.trim() === "") {
//     throw new apiError(400, "Email is required")
// }

  // 3. Check if user already exists
      const existeduser = await User.findOne({
        $or: [{ username: username.toLowerCase() },
    { email: email.toLowerCase() }],
    })
        if(existeduser){
            throw new apiError(400, "User already exists with this username or email")  
        }
        //console.log(req.files);

    // 4. check for images and avatar
   const localavatorpath =  req.files?.avatar[0]?.path;
   //const localcoverpagepath =  req.files?.coverimage[0]?.path;

   let localcoverpagepath;
   if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
       localcoverpagepath = req.files.coverimage[0].path;
   }

    if(!localavatorpath){
        throw new apiError(400, "Avatar and cover image are required")
    }

    // 5. upload images to cloudinary
    const avatar = await uploadonCloudinary(localavatorpath)
    const coverimage =  await uploadonCloudinary(localcoverpagepath)

    if(!avatar){
        throw new apiError(400, "Failed to upload avatar to cloudinary")
    }

    // 6. Create new user object
    let user;
try{
   user = await User.create({
  fullname,
  username: username.toLowerCase(),
  email,
  password,
  avatar: avatar.url,
  coverimage: coverimage?.url || null // Optional cover image

    })
}
 catch (error) {
  if (error.code === 11000) {
    throw new apiError(400, "Username or email already in use");
  }
  throw new apiError(500, "Internal Server Error");
}

    // 7. Save user to database and remove password and refreshToken from the response
    // let createduser1 = await User.findById(user._id);
    //      createduse1r.password = undefined;
    //      createduser1.refreshToken = undefined;
    const createduser =  await User.findById(user._id).select(
        "-password -refreshtoken" // Exclude password and refreshToken from the response
    )

    if(!createduser){
        throw new apiError(500, "Failed to create user")
    }

    // 8. Send response
    return res.status(201).json(
        new Apirsponse(200,createduser, "User registered successfully")
    )

})
 
const loginuser = asynchandler(async (req,res) =>{
    
    // // Login logic here
    // res.status(200).json({
    //     message: "Login user"
    // })

    // 1. Extract user data from request body (req body -> data)
    const {email,username,password} = req.body;

    // 2. Validate user data
    if(!email && !username){
        throw new apiError(400, "Email or username are required");
    }
    // 3. Check if user exists in the database
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new apiError(404, "User not found");
    }
    // 4. Check if password is correct
   const ispasswordvalid =  await user.isPasswordCorrect(password)
     if(!ispasswordvalid){
        throw new apiError(401, "Invalid password");
     }    
     // 5. Generate access token & refresh token
        const { accesstoken , refreshtoken } = await genrateaccessandrefreshtoken(user._id)

    // important: 
    const loggedinuser = await User.findById(user._id).select(
        "-password -refreshtoken" // Exclude password and refreshToken from the response
    )

    // 7: cookie setup for refresh token and user login information
    const cookieoptions = {
        httpOnly : true, // Prevents client-side JavaScript from accessing the cookie
        secure : true  // Ensures the cookie is sent over HTTPS only
    }  

    return res
        .status(200)
        .cookie("accesstoken",accesstoken,cookieoptions)
        .cookie("refreshtoken",refreshtoken,cookieoptions)
        .json(
            new Apirsponse(
                //code
                200,
                {
                    // best for mobile app
                    user: loggedinuser, // User information without password and refreshToken
                    accesstoken, // Access token for authentication
                    refreshtoken // Refresh token for session management
                },
                // message
                "User logged in successfully"
            )
        )
})

// logout user 
 const logoutuser = asynchandler(async (req, res) => {
    // middleware to handle user logout(clear cookies and refresh token) auth.middleware.js
   // 1. Clear refreshToken in DB
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },  // match schema casing
        { new: true }
    )

    // 2. Define secure cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'  // Important for cross-site cookies (optional based on frontend setup)
    }

    // 3. Clear cookies and return response
    return res
        .status(200)
        .clearCookie("accesstoken", cookieOptions)
        .clearCookie("refreshtoken", cookieOptions)
        .json(
            new Apirsponse(200, {}, "User logged out successfully")
        )
})

// change passwoard
const changepassword = asynchandler(async(req,res) =>{
    const { oldpassword , newpassword } = req.body

    const user = await User.findById(req.user?._id)
    const ispasswordcorrect = await user.isPasswordCorrect(oldpassword)

    if(!ispasswordcorrect){
        throw new apiError(400,"Invalid old password")
    }

    user.password = newpassword
    await user.save({validateBeforeSave:false})

    return res
         .status(200)
         .json(
            new Apirsponse(200,{},"password changed successfully")
         )

})

//get current user
const getcurrentuser = asynchandler(async (req,res) =>{
    return res
    .status(200)
    .json(new Apirsponse(200,req.user,"current user fetch successfully"))


})

// update useraccount detail(name and email and others)
const updateaccountdetails = asynchandler(async (req,res) =>{

    const { fullname , email } = req.body
    if(!fullname || !email){
       throw new apiError(400,"ALL fields are required")
    } 

    const user = await User.findByIdAndUpdate
    (req.user?._id,
        {
         $set: {
            fullname:fullname,
            email:email
         }   
    },{new : true} // return update
).select("-password")

    return res
    .status(200)
    .json(new Apirsponse(200,user,"Account details updated successfully"))
})
// updateion on files 
// update avatar image
const updateavatardetails = asynchandler(async (req,res) =>{
    const avatarlocalpath = req.file?.path
    if(!avatarlocalpath){
        throw new apiError(400,"Avatar file is missing")
    }

    const avatar = await uploadonCloudinary(avatarlocalpath)
    if(!avatar.url){
        throw new apiError(400,"Error while uploading on avatar")
    }
     const user  = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },{new : true}
     ).select("-password")

     return res
     .status(200)
     .json(
       new Apirsponse(
        200,
        user,
        "Avatar details update successfully"
       )
     )

})

//cover image updation
const updatecoverimage = asynchandler(async (req,res) =>{
    const coverimagelocalpath = req.file?.path
    if(!coverimagelocalpath){
        throw new apiError(400,"cover image file is missing")
    }

    const coverimage = await uploadonCloudinary(coverimagelocalpath)
    if(!coverimage.url){
        throw new apiError(400,"Error while uploading on avatar")
    }
     const user  = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverimage:coverimage.url
            }
        },{new : true}
     ).select("-password")

     return res
     .status(200)
     .json(
       new Apirsponse(
        200,
        user,
        "cover image details update successfully"
       )
     )

})

//display the scribers and subscribers along with button
const getuserchannelprofit = asynchandler(async (req,res) =>{
    const { username } = req.params

    if(!username){
        throw new apiError(400,"User name is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username : username?.toLowerCase()
            }
        },
        {   
            // count no. of subscriber in channels
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            // count no. of subscribed in channel by me
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedto"
            }
        },
        {
            $addFields:{
               subscriberscount:{
                $size: "$subscribers"
               },
                channelsubscriberscount:{
                $size: "$subscribedto"
               },
               //buttons
                issubscribed:{
                  $cond: {
                       if:{$in: [req.user?._id,"$subscribers.subscriber"]},
                       then:true,
                       else:false
                }
               }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscriberscount:1,
                channelsubscriberscount:1,
                issubscribed:1,
                avatar:1,
                coverimage:1,
                email:1
            }
        }
    ])
    if(!channel?.length){
        throw new apiError(400,"channels  is not exist")
    }

    return res
    .status(200)
    .json(
        new Apirsponse(200,channel[0],"User channel fetched successfully")
    )
})

// add watch history method to display videos and thumbnails
const getwatchhistory = asynchandler(async(req,res) =>{
    const user  = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(req.user.id)
            }

        },
        {
            $lookup:{
                from: "videos",
                localField:"watchhistory",
                foreignField:"_id",
                as:"watchhistory",

                pipeline:[
                    {
                        $lookup:{
                            from : "users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            // array with multiple value
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new Apirsponse(
            200,
            user[0].watchhistory,
            "Watch History fetch successfully"
        )
    )
})
export { registeruser,
    loginuser,
    logoutuser,
    refreshaccesstoken,
    changepassword,
    getcurrentuser,
    updateaccountdetails,
    updateavatardetails,
    updatecoverimage,
    getuserchannelprofit,
     getwatchhistory
 }