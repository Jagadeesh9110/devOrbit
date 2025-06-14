import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

let isConnected = false;

export default async function connectDB() {
  if (isConnected) {
    console.log("MongoDB: Using existing connection");
    return;
  }

  try {
    console.log("MongoDB: Connecting...");
    await mongoose.connect(MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB: Connected successfully");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    throw new Error("Failed to connect to MongoDB");
  }
}
