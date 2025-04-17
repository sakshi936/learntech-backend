"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blogSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mediaType: {
        type: String, // 'image', 'text' or 'video'
        required: true,
    },
    mediaUrl: {
        type: String, // cloud or local URL
        required: true,
    },
    author: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "UserProfileModel",
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.BlogModel = mongoose_1.default.model("Blog", blogSchema);
