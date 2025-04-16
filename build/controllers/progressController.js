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
//For cacheing the roadmap structure
const roadmapStructureCache = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;
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
        // Set cache headers to enable client-side caching for 5 minutes
        res.setHeader('Cache-Control', 'private, max-age=300');
        // Get all user progress records - but only fetch the fields we need
        const progressRecords = await progressModel_1.default.find({ userId }, { roadmapSlug: 1, completedItems: 1, percentage: 1, lastUpdated: 1 }).sort({ lastUpdated: -1 }).lean(); // Use lean() for faster queries
        if (!progressRecords || progressRecords.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    activeRoadmaps: 0,
                    lastCompleted: null,
                    recommendations: [
                        { level: "Level 1", tech: "HTML", topic: "Beginner", item: "Basic Tags", roadmapSlug: "frontend-development", roadmapTitle: "Frontend Development" },
                        { level: "Level 1", tech: "CSS", topic: "Beginner", item: "Selectors", roadmapSlug: "frontend-development", roadmapTitle: "Frontend Development" },
                        { level: "Level 1", tech: "JavaScript Basics", topic: "Beginner", item: "Variables", roadmapSlug: "frontend-development", roadmapTitle: "Frontend Development" }
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
        let mostRecentRecommendations = [];
        let lastCompleted = null;
        let recentRoadmapPercentage = 0;
        // Performance optimization: Set a timeout to prevent long-running operations
        const TIMEOUT = 3000; // 3 seconds timeout
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Recommendation generation timed out')), TIMEOUT));
        // Main recommendation logic
        const recommendationPromise = (async () => {
            if (activeRoadmaps.length > 0) {
                const mostRecentProgress = activeRoadmaps[0];
                recentRoadmapPercentage = mostRecentProgress.percentage;
                // Get roadmap structure for analysis (with caching)
                const roadmapSlug = mostRecentProgress.roadmapSlug;
                let structureData;
                // Check cache first
                if (roadmapStructureCache[roadmapSlug] &&
                    roadmapStructureCache[roadmapSlug].timestamp > Date.now() - CACHE_EXPIRY) {
                    structureData = roadmapStructureCache[roadmapSlug].data;
                }
                else {
                    // Read from file if not in cache
                    const filePath = path_1.default.join(process.cwd(), 'src', 'data', 'roadmaps', `${roadmapSlug}.json`);
                    if (fs_1.default.existsSync(filePath)) {
                        structureData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
                        // Store in cache
                        roadmapStructureCache[roadmapSlug] = {
                            data: structureData,
                            timestamp: Date.now()
                        };
                    }
                    else {
                        console.error(`File not found: ${filePath}`);
                        return {
                            error: true,
                            message: 'Roadmap structure file not found'
                        };
                    }
                }
                // Optimize: Store flattened completed items for faster access
                // Instead of deeply nested loops, we create a flattened version once
                const flatCompletedItems = [];
                const flattener = (obj, parentPath = [], result = []) => {
                    if (!obj || typeof obj !== 'object')
                        return result;
                    if (Object.keys(obj).length === 0)
                        return result;
                    Object.entries(obj).forEach(([key, value]) => {
                        const currentPath = [...parentPath, key];
                        if (value === true) {
                            // This is a completed item
                            const [level, tech, topic, item] = currentPath;
                            if (level && tech && topic && item) {
                                result.push({
                                    level,
                                    tech,
                                    topic,
                                    item,
                                    roadmapSlug,
                                    roadmapTitle: roadmapTitles[roadmapSlug] || roadmapSlug,
                                    levelOrder: Object.keys(structureData).indexOf(level),
                                    techOrder: Object.keys(structureData[level] || {}).indexOf(tech)
                                });
                            }
                        }
                        else if (typeof value === 'object') {
                            // Continue traversing the object
                            flattener(value, currentPath, result);
                        }
                    });
                    return result;
                };
                flattener(mostRecentProgress.completedItems, [], flatCompletedItems);
                // Sort and get most recent completed item
                if (flatCompletedItems.length > 0) {
                    flatCompletedItems.sort((a, b) => {
                        if (a.levelOrder !== b.levelOrder)
                            return b.levelOrder - a.levelOrder;
                        return b.techOrder - a.techOrder;
                    });
                    lastCompleted = flatCompletedItems[0];
                    // Helper to check if item is completed - using a Set for O(1) lookups
                    const completedItemsSet = new Set();
                    flatCompletedItems.forEach((item) => {
                        const key = `${item.level}|${item.tech}|${item.topic}|${item.item}`;
                        completedItemsSet.add(key);
                    });
                    const isCompleted = (level, tech, topic, item) => {
                        const key = `${level}|${tech}|${topic}|${item}`;
                        return completedItemsSet.has(key);
                    };
                    // Get recommendations with more efficient logic
                    const getRecommendationsForRoadmap = (structureData, lastCompleted) => {
                        const recommendations = [];
                        // Get next items in current topic
                        const currentTech = structureData[lastCompleted.level]?.[lastCompleted.tech];
                        if (currentTech) {
                            const topicItems = currentTech[lastCompleted.topic];
                            if (Array.isArray(topicItems)) {
                                for (const item of topicItems) {
                                    const itemText = typeof item === 'string' ? item : item.name || item.text || Object.keys(item)[0];
                                    if (!isCompleted(lastCompleted.level, lastCompleted.tech, lastCompleted.topic, itemText)) {
                                        recommendations.push({
                                            level: lastCompleted.level,
                                            tech: lastCompleted.tech,
                                            topic: lastCompleted.topic,
                                            item: itemText,
                                            roadmapSlug,
                                            roadmapTitle: roadmapTitles[roadmapSlug] || roadmapSlug
                                        });
                                        if (recommendations.length >= 3)
                                            break;
                                    }
                                }
                            }
                        }
                        return recommendations;
                    };
                    mostRecentRecommendations = getRecommendationsForRoadmap(structureData, lastCompleted);
                }
            }
            // If we need more recommendations, get from other active roadmaps
            // Only execute this if we need more and have other roadmaps
            const recommendationsNeeded = 3 - mostRecentRecommendations.length;
            if (recommendationsNeeded > 0 && activeRoadmaps.length > 1) {
                // Process at most 2 additional roadmaps to limit processing time
                const roadmapsToProcess = Math.min(2, activeRoadmaps.length - 1);
                for (let i = 1; i <= roadmapsToProcess && mostRecentRecommendations.length < 3; i++) {
                    const otherProgress = activeRoadmaps[i];
                    const roadmapSlug = otherProgress.roadmapSlug;
                    // Use cached structure data if available
                    let structureData;
                    if (roadmapStructureCache[roadmapSlug] &&
                        roadmapStructureCache[roadmapSlug].timestamp > Date.now() - CACHE_EXPIRY) {
                        structureData = roadmapStructureCache[roadmapSlug].data;
                    }
                    else {
                        const filePath = path_1.default.join(process.cwd(), 'src', 'data', 'roadmaps', `${roadmapSlug}.json`);
                        if (fs_1.default.existsSync(filePath)) {
                            structureData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
                            roadmapStructureCache[roadmapSlug] = {
                                data: structureData,
                                timestamp: Date.now()
                            };
                        }
                        else {
                            continue; // Skip this roadmap if file not found
                        }
                    }
                    // Find first incomplete item more efficiently
                    // Instead of nested loops, implement early exit and chunking
                    outerLoop: for (const level in structureData) {
                        for (const tech in structureData[level]) {
                            for (const topic in structureData[level][tech]) {
                                if (Array.isArray(structureData[level][tech][topic])) {
                                    // Only check first 5 items in each topic to improve performance
                                    const itemsToCheck = structureData[level][tech][topic].slice(0, 5);
                                    for (const item of itemsToCheck) {
                                        const itemText = typeof item === 'string' ? item : item.name || item.text || Object.keys(item)[0];
                                        // Check if this item is not completed
                                        if (!otherProgress.completedItems?.[level]?.[tech]?.[topic]?.[itemText]) {
                                            mostRecentRecommendations.push({
                                                level,
                                                tech,
                                                topic,
                                                item: itemText,
                                                roadmapSlug,
                                                roadmapTitle: roadmapTitles[roadmapSlug] || roadmapSlug
                                            });
                                            if (mostRecentRecommendations.length >= 3) {
                                                break outerLoop; // Break out of all loops
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return {
                error: false
            };
        })();
        // Execute with timeout protection
        try {
            const result = await Promise.race([recommendationPromise, timeoutPromise]);
            if (result && result.error) {
                return res.status(404).json({ success: false, message: result.message });
            }
        }
        catch (timeoutError) {
            console.warn('Recommendation generation timed out, using simple recommendations');
            // If timeout occurs, provide simple recommendations
            if (mostRecentRecommendations.length === 0) {
                mostRecentRecommendations = activeRoadmaps.slice(0, 3).map(p => ({
                    level: "Continue with",
                    tech: "",
                    topic: "",
                    item: roadmapTitles[p.roadmapSlug] || p.roadmapSlug,
                    roadmapSlug: p.roadmapSlug,
                    roadmapTitle: roadmapTitles[p.roadmapSlug] || p.roadmapSlug
                }));
            }
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
        else if (recentRoadmapPercentage < 100) {
            message = "You're almost there! Just a few more topics to complete your journey.";
        }
        else {
            message = "Try exploring a new roadmap to continue your learning journey!";
        }
        const responseData = {
            success: true,
            data: {
                activeRoadmaps: activeRoadmaps.length,
                lastCompleted,
                recommendations: mostRecentRecommendations,
                message
            }
        };
        const endTime = Date.now();
        console.log(`Recommendations generated in ${endTime - startTime}ms`);
        return res.status(200).json(responseData);
    }
    catch (error) {
        const endTime = Date.now();
        console.error(`Error generating recommendations in ${endTime - startTime}ms:`, error);
        res.status(500).json({ success: false, message: 'Error generating recommendations' });
    }
};
exports.getRecommendations = getRecommendations;
