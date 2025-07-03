import { Router } from "express";
import {
    Tweet_creation,
    Tweet_updation,
    deleteTweet,
    getUserTweet
} from "../controllers/tweets.controllers.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =  Router();

router.use(verifyJWT);

// route to post tweets
router.route("/").post(Tweet_creation);

// route to get user tweets
router
    .route("/user/:userid")
    .get(getUserTweet);


// route to update and delete  tweets 
router
    .route("/:tweetid").patch(Tweet_updation).delete(deleteTweet);

export default router