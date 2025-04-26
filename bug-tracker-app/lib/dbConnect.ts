import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable in .env.local"
  );
}
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("Already connected to mongodb");
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    throw new Error(`Error Connecting to mongodb : ${err} `);
  }
};

export default connectDB;
