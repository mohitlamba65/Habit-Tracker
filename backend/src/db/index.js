import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbName = process.env.DB_NAME;
    const uri = process.env.MONGODB_URI;

    if (!uri || !dbName) {
      throw new Error("MongoDB URI or DB name is missing");
    }

    await mongoose.connect(uri, {
      dbName: dbName, 
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
