"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.getProgressStats = exports.getAllProgress = exports.updateProgress = exports.getProgress = void 0;
const progressModel_1 = __importDefault(require("../models/progressModel"));
const roadmapModel_1 = __importDefault(require("../models/roadmapModel"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// For Cacheing roadmap structure data
const roadmapStructureCache = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
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
        //  console.log(userId)
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
// Get recommendations based on user's progress
const getRecommendations = async (req, res) => {
    const startTime = Date.now();
    try {
        const userId = req.user.userId;
        // Get all user progress records - only fetch what we need
        const progressRecords = await progressModel_1.default.find({ userId }, { roadmapSlug: 1, completedItems: 1, percentage: 1, lastUpdated: 1 }).sort({ lastUpdated: -1 }).lean();
        if (!progressRecords || progressRecords.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    activeRoadmaps: 0,
                    lastCompleted: null,
                    recommendations: [
                        { level: "Level 1", tech: "HTML", topic: "Beginner", item: "Basic Tags", roadmapSlug: "frontend-development", roadmapTitle: "Frontend Development" },
                        { level: "Level 1", tech: "CSS", topic: "Beginner", item: "Selectors", roadmapSlug: "frontend-development", roadmapTitle: "Frontend Development" }
                    ],
                    message: "Start your journey with these fundamentals!"
                }
            });
        }
        // Get roadmap titles in a single query
        const roadmapSlugs = [...new Set(progressRecords.map(p => p.roadmapSlug))];
        const roadmaps = await roadmapModel_1.default.find({ slug: { $in: roadmapSlugs } }, { slug: 1, title: 1 }).lean();
        // Create slug to title mapping
        const roadmapTitles = roadmaps.reduce((map, r) => {
            map[r.slug] = r.title;
            return map;
        }, {});
        // Find active roadmaps (with progress but not completed)
        const activeRoadmaps = progressRecords.filter(p => p.completedItems &&
            Object.keys(p.completedItems).length > 0 &&
            p.percentage < 100);
        if (activeRoadmaps.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    activeRoadmaps: 0,
                    lastCompleted: null,
                    recommendations: [
                        { level: "Level 1", tech: "HTML", topic: "Beginner", item: "Basic Tags", roadmapSlug: "frontend-development", roadmapTitle: "Frontend Development" },
                        { level: "Level 1", tech: "CSS", topic: "Beginner", item: "Selectors", roadmapSlug: "frontend-development", roadmapTitle: "Frontend Development" }
                    ],
                    message: "Start your journey with these fundamentals!"
                }
            });
        }
        // Take the most recent active roadmap
        const mostRecentProgress = activeRoadmaps[0];
        const roadmapSlug = mostRecentProgress.roadmapSlug;
        const roadmapTitle = roadmapTitles[roadmapSlug] || roadmapSlug;
        const recentRoadmapPercentage = mostRecentProgress.percentage || 0;
        // Find the last completed item
        let lastCompleted = null;
        const recommendations = [];
        // Simple function to find the last completed item
        const findLastCompletedItem = (obj, path = []) => {
            if (!obj || typeof obj !== 'object')
                return;
            // Sort keys to ensure we get items in correct order
            const keys = Object.keys(obj);
            // Process in reverse to prioritize later items
            for (let i = keys.length - 1; i >= 0; i--) {
                const key = keys[i];
                const value = obj[key];
                const currentPath = [...path, key];
                if (value === true) {
                    // Found a completed item
                    if (currentPath.length >= 4) { // [level, tech, topic, item]
                        const [level, tech, topic, item] = currentPath;
                        // If we don't have a lastCompleted yet, set it
                        if (!lastCompleted) {
                            lastCompleted = {
                                level, tech, topic, item,
                                roadmapSlug,
                                roadmapTitle
                            };
                            return true; // Found it
                        }
                    }
                }
                else if (typeof value === 'object') {
                    // Continue traversing
                    if (findLastCompletedItem(value, currentPath)) {
                        return true; // Found in deeper level
                    }
                }
            }
            return false;
        };
        findLastCompletedItem(mostRecentProgress.completedItems);
        // Get roadmap structure from file system with basic caching
        let structureData;
        if (roadmapStructureCache[roadmapSlug] &&
            roadmapStructureCache[roadmapSlug].timestamp > Date.now() - CACHE_EXPIRY) {
            structureData = roadmapStructureCache[roadmapSlug].data;
        }
        else {
            // Read from file if not in cache
            const filePath = path_1.default.join(process.cwd(), 'src', 'data', 'roadmaps', `${roadmapSlug}.json`);
            if (fs_1.default.existsSync(filePath)) {
                structureData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
                roadmapStructureCache[roadmapSlug] = {
                    data: structureData,
                    timestamp: Date.now()
                };
            }
            else {
                // If file not found, just create a basic recommendation
                recommendations.push({
                    level: "Continue with",
                    tech: "",
                    topic: "",
                    item: roadmapTitle,
                    roadmapSlug,
                    roadmapTitle
                });
            }
        }
        // If we have both last completed item and structure data, find next topics
        if (lastCompleted && structureData) {
            const { level, tech, topic, item } = lastCompleted;
            // Helper to get 1-2 recommendations in the same topic
            const findNextItemsInTopic = () => {
                // Check if the level, tech, and topic exist in structure
                if (structureData[level]?.[tech]?.[topic] && Array.isArray(structureData[level][tech][topic])) {
                    const topicItems = structureData[level][tech][topic];
                    // Find index of current item
                    let currentIndex = -1;
                    for (let i = 0; i < topicItems.length; i++) {
                        const itemText = typeof topicItems[i] === 'string' ?
                            topicItems[i] :
                            topicItems[i].name || topicItems[i].text || Object.keys(topicItems[i])[0];
                        if (itemText === item) {
                            currentIndex = i;
                            break;
                        }
                    }
                    // Get next 1-2 items
                    if (currentIndex !== -1 && currentIndex < topicItems.length - 1) {
                        for (let i = currentIndex + 1; i < topicItems.length && recommendations.length < 2; i++) {
                            const nextItem = topicItems[i];
                            const nextItemText = typeof nextItem === 'string' ?
                                nextItem :
                                nextItem.name || nextItem.text || Object.keys(nextItem)[0];
                            recommendations.push({
                                level,
                                tech,
                                topic,
                                item: nextItemText,
                                roadmapSlug,
                                roadmapTitle
                            });
                        }
                    }
                }
            };
            // Helper to find next topic in the same tech
            const findNextTopic = () => {
                if (recommendations.length >= 2)
                    return; // Already have enough
                if (structureData[level]?.[tech]) {
                    const topics = Object.keys(structureData[level][tech]);
                    const currentTopicIndex = topics.indexOf(topic);
                    if (currentTopicIndex !== -1 && currentTopicIndex < topics.length - 1) {
                        const nextTopic = topics[currentTopicIndex + 1];
                        if (Array.isArray(structureData[level][tech][nextTopic]) &&
                            structureData[level][tech][nextTopic].length > 0) {
                            const firstItem = structureData[level][tech][nextTopic][0];
                            const itemText = typeof firstItem === 'string' ?
                                firstItem :
                                firstItem.name || firstItem.text || Object.keys(firstItem)[0];
                            recommendations.push({
                                level,
                                tech,
                                topic: nextTopic,
                                item: itemText,
                                roadmapSlug,
                                roadmapTitle
                            });
                        }
                    }
                }
            };
            // Get next items in order of priority
            findNextItemsInTopic();
            findNextTopic();
        }
        // If we still need recommendations, add a generic one
        if (recommendations.length === 0) {
            recommendations.push({
                level: "Continue with",
                tech: "",
                topic: "",
                item: roadmapTitle,
                roadmapSlug,
                roadmapTitle
            });
        }
        // Generate motivational message
        let message = "";
        if (recentRoadmapPercentage < 25) {
            message = "You're making great progress! Keep going with these next topics.";
        }
        else if (recentRoadmapPercentage < 50) {
            message = "You're building momentum! These topics will take your skills to the next level.";
        }
        else if (recentRoadmapPercentage < 75) {
            message = "You're well on your way to mastery! Tackle these topics next.";
        }
        else {
            message = "You're almost there! Just a few more topics to complete your journey.";
        }
        const endTime = Date.now();
        // console.log(`Simplified recommendations generated in ${endTime - startTime}ms`);
        return res.status(200).json({
            success: true,
            data: {
                activeRoadmaps: activeRoadmaps.length,
                lastCompleted,
                recommendations,
                message
            }
        });
    }
    catch (error) {
        const endTime = Date.now();
        console.error(`Error generating recommendations in ${endTime - startTime}ms:`, error);
        return res.status(500).json({
            success: false,
            message: 'Error generating recommendations'
        });
    }
};
exports.getRecommendations = getRecommendations;
