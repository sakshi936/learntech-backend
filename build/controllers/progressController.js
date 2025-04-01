"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgressStats = exports.getAllProgress = exports.updateProgress = exports.getProgress = void 0;
const progressModel_1 = __importDefault(require("../models/progressModel"));
const roadmapModel_1 = __importDefault(require("../models/roadmapModel"));
// Get progress for a specific roadmap
const getProgress = async (req, res) => {
    try {
        const { roadmapSlug } = req.params;
        const userId = req.user.userId;
        const progress = await progressModel_1.default.findOne({ userId, roadmapSlug });
        res.status(200).json({
            success: true,
            data: progress ? {
                completedItems: progress.completedItems,
                percentage: progress.percentage,
                lastUpdated: progress.lastUpdated
            } : {
                completedItems: {},
                percentage: 0,
                lastUpdated: new Date()
            }
        });
    }
    catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getProgress = getProgress;
// Update progress for a specific roadmap
const updateProgress = async (req, res) => {
    try {
        const { roadmapSlug } = req.params;
        const { completedItems } = req.body;
        const userId = req.user.userId;
        // Validate roadmap exists
        const roadmap = await roadmapModel_1.default.findOne({ slug: roadmapSlug });
        if (!roadmap) {
            res.status(404).json({ success: false, message: 'Roadmap not found' });
            return;
        }
        // Upsert - update if exists, create if not
        let progress = await progressModel_1.default.findOne({ userId, roadmapSlug });
        // console.log(progress)
        if (progress) {
            progress.completedItems = completedItems;
            progress.lastUpdated = new Date();
            await progress.save();
        }
        else {
            progress = new progressModel_1.default({
                userId,
                roadmapSlug,
                completedItems
            });
            await progress.save();
        }
        res.status(200).json({
            success: true,
            data: {
                completedItems: progress.completedItems,
                percentage: progress.percentage,
                lastUpdated: progress.lastUpdated
            }
        });
    }
    catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateProgress = updateProgress;
// Get all progress for the current user
const getAllProgress = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get all progress records for the user
        const progressRecords = await progressModel_1.default.find({ userId });
        // Get all roadmaps to include titles
        const roadmapSlugs = progressRecords.map(p => p.roadmapSlug);
        const roadmaps = await roadmapModel_1.default.find({
            slug: { $in: roadmapSlugs }
        }).select('slug title imageUrl');
        // Create a map of roadmap slugs to titles
        const roadmapInfo = {};
        roadmaps.forEach(r => {
            roadmapInfo[r.slug] = {
                title: r.title
            };
        });
        // Format the response
        const result = {};
        progressRecords.forEach(progress => {
            result[progress.roadmapSlug] = {
                completedItems: progress.completedItems,
                percentage: progress.percentage,
                lastUpdated: progress.lastUpdated,
                title: roadmapInfo[progress.roadmapSlug]?.title || progress.roadmapSlug,
            };
        });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error fetching all progress:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllProgress = getAllProgress;
// Get user progress stats
const getProgressStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get all progress records for the user
        const progressRecords = await progressModel_1.default.find({ userId });
        // Calculate stats
        const totalRoadmaps = progressRecords.length;
        const completedRoadmaps = progressRecords.filter(p => p.percentage === 100).length;
        const inProgressRoadmaps = totalRoadmaps - completedRoadmaps;
        // Calculate average completion if there are any roadmaps
        const averageCompletion = totalRoadmaps > 0
            ? Math.round(progressRecords.reduce((sum, p) => sum + p.percentage, 0) / totalRoadmaps)
            : 0;
        res.status(200).json({
            success: true,
            data: {
                totalRoadmaps,
                completedRoadmaps,
                inProgressRoadmaps,
                averageCompletion
            }
        });
    }
    catch (error) {
        console.error('Error fetching progress stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getProgressStats = getProgressStats;
