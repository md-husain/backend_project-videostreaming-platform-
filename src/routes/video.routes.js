import { Router } from "express";
import {
     extract_all_videos,
    Upload_videos,
    extract_videobyid,
    update_video,
    Delete_video,
    toggle_public_status
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer_middleware.js";

const router = Router();

router.use(verifyJWT);

// route for extract & upload videos
router
     .route("/")
     .get(extract_all_videos)
     .post(
        upload.fields(
            [
                {
                    name : "videofile",
                    maxCount:1,
                },
                {
                    name : "thumbnail",
                    maxCount:1,
                },
            ]
        ),
        Upload_videos
     );
// route for extract by id , delete,update videos
router
    .route("/:videoid")
    .get(extract_videobyid)
    .delete(Delete_video)
    .patch(upload.fields(
        [
            {name:"videofile",maxCount:1},
            {name:"thumbnail",maxCount:1}
        ]
        ),update_video);

// toggle and publish the videos
router.route("/toggle/publish/:videoid").patch(toggle_public_status)

export default router
