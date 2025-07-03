import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }))

  // security pratices
  //set limit
  app.use(express.json({
    limit: '50kb' // Increase the limit to 50kb
  }));
  //from url +,% btw in name
  app.use(express.urlencoded({extended:true , limit: '50kb'})) // Increase the limit to 50kb

  // ex ki config static img/file of public\
  app.use(express.static('public'))

  // cookie parser(server se client ke browser ki cookies ko access/set karne ke liye)
  app.use(cookieParser())


// import routes
import userrouter from './routes/user.routes.js';
import videorouter from './routes/video.routes.js';
import subscriberrouter from './routes/subscriber.routes.js';
 import tweetrouter from './routes/tweets.routes.js';
 import likerouter from './routes/like.routes.js';
import commentrouter from './routes/comment.routes.js';
 import playlistrouter from './routes/playlist.routes.js';



// routes declaration
app.use("/api/v1/user",userrouter)
app.use("/api/v1/video",videorouter)
app.use("/api/v1/tweet",tweetrouter)
app.use("/api/v1/subscription",subscriberrouter)
app.use("/api/v1/like",likerouter)
app.use("/api/v1/comment",commentrouter)
app.use("/api/v1/playlist",playlistrouter)





  
export { app }