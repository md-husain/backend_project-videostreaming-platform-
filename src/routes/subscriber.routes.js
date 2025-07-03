import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controllers.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =  Router()

router.use(verifyJWT)

// route to get subs channels and tooglen subs

router
    .route("/c/:channelid")
    .get(getSubscribedChannels)
    .post(toggleSubscription)

// route to get users who s subs the channels

router
    .route("/u/:subscriberid").get(getUserChannelSubscribers)


export default router