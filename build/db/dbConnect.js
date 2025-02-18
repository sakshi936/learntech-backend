"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dbConnect = async () => {
    try {
        const db = await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
    }
    catch (error) {
        console.log('Error in connecting to DB', error);
        process.exit(1);
    }
};
exports.default = dbConnect;
