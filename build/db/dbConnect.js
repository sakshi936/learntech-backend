"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let cached = global.mongooseCache;
if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}
const dbConnect = async () => {
    try {
        if (cached.conn)
            return cached.conn;
        if (!cached.promise) {
            cached.promise = mongoose_1.default.connect(process.env.MONGODB_URI, {
                maxPoolSize: 10,
                // bufferCommands: false,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4, // Use IPv4, skip trying IPv6
            });
        }
        cached.conn = await cached.promise;
        return cached.conn;
    }
    catch (error) {
        console.log("Error in connecting to DB", error);
        // process.exit(1);
    }
};
exports.default = dbConnect;
