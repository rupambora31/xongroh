import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    // "connectionInstance": mongoose will send a return-object (response after connection)
    console.log(
      `\nMongoDB Connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection FAILED! ", error);
    process.exit(1);
  }
};

export default connectDB;
