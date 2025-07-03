import { Router } from "express";
import {
    toggle_liked_video,
    toggle_liked_comment,
    toggle_liked_tweet,
    get_liked_vidoes
} from "../controllers/like.controllers.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =  Router()

router.use(verifyJWT)


router
    .route("/toggle/v/:videoid")
    .post(toggle_liked_video)


router
    .route("/toggle/v/:commentid")
    .post(toggle_liked_comment)

router
    .route("/toggle/v/:tweetid")
    .post(toggle_liked_tweet)

router
     .route("/videos")
     .get(get_liked_vidoes)

export default router