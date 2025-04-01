"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoadmapBySlug = exports.getAllRoadmaps = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const roadmapModel_1 = __importDefault(require("../models/roadmapModel"));
// Get all roadmaps
const getAllRoadmaps = async (req, res) => {
    try {
        const roadmaps = await roadmapModel_1.default.find().select('-__v');
        res.status(200).json({ success: true, data: roadmaps });
    }
    catch (error) {
        console.error('Error fetching roadmaps:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllRoadmaps = getAllRoadmaps;
// Get roadmap by slug
const getRoadmapBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        // Find roadmap metadata
        const roadmap = await roadmapModel_1.default.findOne({ slug });
        if (!roadmap) {
            res.status(404).json({ success: false, message: 'Roadmap not found' });
            return;
        }
        // Load roadmap structure from JSON file
        const filePath = path_1.default.join(process.cwd(), 'src', 'data', 'roadmaps', `${slug}.json`);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ success: false, message: 'Roadmap structure not found' });
            return;
        }
        const structureData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
        // Combine metadata and structure
        const result = {
            ...roadmap.toObject(),
            structure: structureData
        };
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error('Error fetching roadmap:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRoadmapBySlug = getRoadmapBySlug;
