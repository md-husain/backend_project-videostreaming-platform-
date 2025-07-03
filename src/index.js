// not genally used in production
// This file is the entry point of the application
// require("dotenv").config({ path:"./env"})
import dotenv from "dotenv"; // Load environment variables from .env file
import { app } from "./app.js";
import mongoose from "mongoose";
import { db_name } from "./constants.js";
import express from "express";
import connectDB from "./DB/dbidx.js";
// not direct connect to db becz time consuming use (ASync/Await)
// use ified function to connect to the database because to hadle async/await properly


// approach 2
// dotenv.config({
//     path: "./env"
// })
// connectDB()
// .then(() =>{
//       app.listen(process.env.PORT || 8000,() =>{
//         console.log(`Server is running on port ${process.env.PORT }`);
//       })
// })
// .catch((error) => {
//     console.error("Error connecting to the database:", error);
//     process.exit(1); // Exit the process with failure
// })





//  //approch 1
dotenv.config({ path: "./env" });

//const app = express();

(async () => {
    try {
        // Use only process.env.MONGO_URI if it already contains the db name
        await mongoose.connect(process.env.MONGO_URI);

        app.on("error", (e) => {
            console.error("Error in app:", e);
            throw e;
        });

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process if DB connection fails
    }
})();

