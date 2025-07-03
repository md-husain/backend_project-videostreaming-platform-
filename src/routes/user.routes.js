import { Router } from "express"; 
import { upload } from "../middlewares/multer_middleware.js"
import { logoutuser
    ,loginuser
    ,registeruser
    ,refreshaccesstoken
    , changepassword
    ,getcurrentuser
    ,updateaccountdetails
    ,updateavatardetails,
    updatecoverimage ,
    getuserchannelprofit,
    getwatchhistory} 
    from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
// user register
router.route("/register").post(
    upload.fields([
           {
            name : "avatar",
            maxCount: 1 // max 1 file
           },
           {
            name :"coverimage",
            maxCount:1
           }
    ]),
    registeruser
)

//user login
router.route("/login").post(loginuser)

// user logout
// secure route
router.route("/logout").post(verifyJWT,logoutuser)
router.route("/refresh-token").post(refreshaccesstoken)
// in all routes user must be logedin(verify jwt)
router.route("/change-password").post(verifyJWT,changepassword)
router.route("/get-currentuser").get(verifyJWT,getcurrentuser)
router.route("/update-accountdetails").patch(verifyJWT,updateaccountdetails)

// here is files uplaod comes so use of middleware multer
router.route("/get-avatar").patch(verifyJWT,upload.single("/avatar"),updateavatardetails)
router.route("/update-coverimage").patch(verifyJWT,upload.single("cover-image"),updatecoverimage)

// for getuserchannelprofit use kr rhe params
router.route("/c/:username").get(verifyJWT,getuserchannelprofit)

router.route("get-userhistory").get(verifyJWT,getwatchhistory)


// https://localhost:8000/api/v1/user/register
export default router

