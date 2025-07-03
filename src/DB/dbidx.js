import mongoose from "mongoose";
import express from "express";
import { db_name } from "../constants.js";
// approach 2

const connectDB = async() =>{
           try {
           const connectioninstance =  await mongoose.connect(`${process.env.MONGO_URI}/${db_name}`, )
            console.log(`\n MONGODB connected successfully${connectioninstance.connection.host}`);

           } catch (error) {
            console.log("MONGODB connection error:", error);
            process.exit(1); // Exit the process with failure
           }
}
export default connectDB;