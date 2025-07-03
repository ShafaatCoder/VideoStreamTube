import dotenv from "dotenv";
dotenv.config(); // 👈 must be called before using process.env

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URL); // 🔍 DEBUG LINE
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
