"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventQuestionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Create the Question schema
const EventQuestionSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    question: {
        type: String,
        required: [true, 'Question is required'],
        trim: true,
    },
    answer: {
        type: String,
        default: "", // Empty string by default
    },
    isAnswered: {
        type: Boolean,
        default: false,
    },
    upvotes: {
        type: Number,
        default: 0,
    },
    upvotedBy: {
        type: [String], // Array of user IDs who upvoted the question
        default: [],
    },
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});
// Create and export the Question model
exports.EventQuestionModel = mongoose_1.default.model('EventQuestion', EventQuestionSchema);
