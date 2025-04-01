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
const mongoose_1 = __importStar(require("mongoose"));
const ProgressSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    roadmapSlug: {
        type: String,
        required: true,
        index: true
    },
    completedItems: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    percentage: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
// Pre-save middleware to calculate percentage
ProgressSchema.pre('save', function (next) {
    const progress = this;
    let totalItems = 0;
    let completedCount = 0;
    // Count total items and completed items
    for (const level in progress.completedItems) {
        for (const tech in progress.completedItems[level]) {
            for (const topic in progress.completedItems[level][tech]) {
                for (const item in progress.completedItems[level][tech][topic]) {
                    totalItems++;
                    if (progress.completedItems[level][tech][topic][item]) {
                        completedCount++;
                    }
                }
            }
        }
    }
    progress.percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
    progress.lastUpdated = new Date();
    next();
});
const ProgressModel = (mongoose_1.default.models.Progress) || mongoose_1.default.model('Progress', ProgressSchema);
exports.default = ProgressModel;
