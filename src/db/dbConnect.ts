import mongoose, { Mongoose } from "mongoose";

// Global connection cache for serverless environments(vercel, netlify, etc.)
// This is to prevent multiple connections to the database when the serverless function is invoked multiple times
declare global {
  // Allow global `mongoose` across hot reloads in dev
  var mongooseCache:
    | {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      }
    | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

const dbConnect = async () => {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
        maxPoolSize: 10,
        // bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.log("Error in connecting to DB", error);
    // process.exit(1);
  }
};

export default dbConnect;
