import { Router } from "express";
import {
   Extract_vedio_comments,
    Comment_addtion,
    Comment_updation,
    Comment_deletion
} from "../controllers/comment.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =  Router()

router.use(verifyJWT)


router
    .route("/:videoid")
    .get(Extract_vedio_comments)
    .post(Comment_addtion)


router
    .route("/c/:commentid")
    .delete(Comment_deletion)
    .patch(Comment_updation)



export default router