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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const roadmapModel_1 = __importDefault(require("./roadmapModel"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
ProgressSchema.pre('save', async function (next) {
    try {
        const progress = this;
        // Get the roadmap data based on the slug
        const roadmap = await roadmapModel_1.default.findOne({ slug: progress.roadmapSlug });
        if (!roadmap) {
            // If roadmap not found, proceed without changing percentage
            next();
            return;
        }
        const filePath = path_1.default.join(process.cwd(), 'src', 'data', 'roadmaps', `${roadmap.slug}.json`);
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`Roadmap structure file not found: ${filePath}`);
        }
        const structureData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
        let totalItems = 0;
        let completedCount = 0;
        // Count total items from roadmap data
        // The structure is of nested objects, with levels as object keys instead of array items
        for (const levelName of Object.keys(structureData)) {
            const technologies = structureData[levelName];
            for (const techName of Object.keys(technologies)) {
                const difficulties = technologies[techName];
                for (const difficultyName of Object.keys(difficulties)) {
                    // Skip non-array properties (like 'Note')
                    if (Array.isArray(difficulties[difficultyName])) {
                        const items = difficulties[difficultyName];
                        for (const item of items) {
                            totalItems++;
                            // Check if this item is completed in user's progress
                            const isCompleted = progress.completedItems?.[levelName]?.[techName]?.[difficultyName]?.[item] === true;
                            if (isCompleted) {
                                completedCount++;
                            }
                        }
                    }
                }
            }
        }
        progress.percentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
        progress.lastUpdated = new Date();
        next();
    }
    catch (error) {
        next(error);
    }
});
const ProgressModel = (mongoose_1.default.models.Progress) || mongoose_1.default.model('Progress', ProgressSchema);
exports.default = ProgressModel;
