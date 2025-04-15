import { Request, Response } from 'express';
import Progress from '../models/progressModel';
import Roadmap from '../models/roadmapModel';
import path from 'path';
import fs from 'fs';

// Get progress for a specific roadmap
export const getProgress = async (req: Request, res: Response) => {
  try {
    const { roadmapSlug } = req.params;
    const userId = req.user.userId;
    const progress = await Progress.findOne({ userId, roadmapSlug });
    
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
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update progress for a specific roadmap
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { roadmapSlug } = req.params;
    const { completedItems } = req.body;
    const userId = req.user.userId;
    
    // Validate roadmap exists
    const roadmap = await Roadmap.findOne({ slug: roadmapSlug });
    if (!roadmap) {
      res.status(404).json({ success: false, message: 'Roadmap not found' });
      return 
    }
    
    // Upsert - update if exists, create if not
    let progress = await Progress.findOne({ userId, roadmapSlug });
    // console.log(progress)
    
    if (progress) {
      progress.completedItems = completedItems;
      progress.lastUpdated = new Date();
      await progress.save();
    } else {
      progress = new Progress({
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
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all progress for the current user
export const getAllProgress = async (req: Request, res: Response) => {
   try {
     const userId = req.user.userId;
    //  console.log(userId)
     
     // Get all progress records for the user
     const progressRecords = await Progress.find({ userId });
     
     // Get all roadmaps to include titles
     const roadmapSlugs = progressRecords.map(p => p.roadmapSlug);
     const roadmaps = await Roadmap.find({ 
       slug: { $in: roadmapSlugs } 
     }).select('slug title imageUrl');
     
     // Create a map of roadmap slugs to titles
     const roadmapInfo:any = {};

     roadmaps.forEach(r => {
       roadmapInfo[r.slug] = {
         title: r.title
       };
     });
     
     // Format the response
     const result:any = {};
     
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
   } catch (error) {
     console.error('Error fetching all progress:', error);
     res.status(500).json({ success: false, message: 'Server error' });
   }
 };
 
 // Get user progress stats
 export const getProgressStats = async (req: Request, res: Response) => {
   try {
     const userId = req.user.userId;
     
     // Get all progress records for the user
     const progressRecords = await Progress.find({ userId });
     
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
   } catch (error) {
     console.error('Error fetching progress stats:', error);
     res.status(500).json({ success: false, message: 'Server error' });
   }
 };

// Get recommendations based on user's progress
export const getRecommendations = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user.userId;
    
    // Get all user progress records
    const progressRecords = await Progress.find({ userId });
    
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
    
    // Get all roadmaps info for titles
    const roadmapSlugs = progressRecords.map(p => p.roadmapSlug);
    const roadmaps = await Roadmap.find({ 
      slug: { $in: roadmapSlugs } 
    }).select('slug title');
    
    // Create slug to title mapping
    const roadmapTitles:any = {};
    roadmaps.forEach(r => {
      roadmapTitles[r.slug]  = r.title;
    });
    
    // Sort progress records by lastUpdated (most recent first)
    progressRecords.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
    
    // Get most recent roadmap's recommendations
    let mostRecentRecommendations:any = [];
    let lastCompleted = null;
    let recentRoadmapPercentage = 0;
    
    // Only process roadmaps with some progress but not completed
    const activeRoadmaps = progressRecords.filter(p => 
      Object.keys(p.completedItems).length > 0 && p.percentage < 100
    );
    
    if (activeRoadmaps.length > 0) {
      const mostRecentProgress = activeRoadmaps[0];
      recentRoadmapPercentage = mostRecentProgress.percentage;
      
      // Get roadmap structure for analysis
      const roadmapSlug = mostRecentProgress.roadmapSlug;
      const filePath = path.join(process.cwd(), 'src', 'data', 'roadmaps', `${roadmapSlug}.json`);
      
      if (fs.existsSync(filePath)) {
        const structureData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Find last completed item
        const flatCompletedItems = [];
        for (const level in mostRecentProgress.completedItems) {
          for (const tech in mostRecentProgress.completedItems[level]) {
            for (const topic in mostRecentProgress.completedItems[level][tech]) {
              for (const item in mostRecentProgress.completedItems[level][tech][topic]) {
                if (mostRecentProgress.completedItems[level][tech][topic][item] === true) {
                  flatCompletedItems.push({
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
            }
          }
        }
        
        // Sort and get most recent completed item
        flatCompletedItems.sort((a, b) => {
          if (a.levelOrder !== b.levelOrder) return b.levelOrder - a.levelOrder;
          return b.techOrder - a.techOrder;
        });
        
        if (flatCompletedItems.length > 0) {
          lastCompleted = flatCompletedItems[0];
          
          // Get recommendations using similar logic as before
          // Helper to check if item is completed
          const isCompleted = (level:any, tech:any, topic:any, item:any) => {
            return mostRecentProgress.completedItems?.[level]?.[tech]?.[topic]?.[item] === true;
          };
          
          // Generate recommendations using the same logic as before
          // (simplified for brevity in this example)
          const getRecommendationsForRoadmap = (structureData:any, lastCompleted:any) => {
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
                    if (recommendations.length >= 3) break;
                  }
                }
              }
            }
            
            return recommendations;
          };
          
          mostRecentRecommendations = getRecommendationsForRoadmap(structureData, lastCompleted);
        }
      }
    }
    
    // If we need more recommendations, get from other active roadmaps
    const recommendationsNeeded = 3 - mostRecentRecommendations.length;
    if (recommendationsNeeded > 0 && activeRoadmaps.length > 1) {
      for (let i = 1; i < activeRoadmaps.length && mostRecentRecommendations.length < 3; i++) {
        const otherProgress = activeRoadmaps[i];
        const roadmapSlug = otherProgress.roadmapSlug;
        const filePath = path.join(process.cwd(), 'src', 'data', 'roadmaps', `${roadmapSlug}.json`);
        
        if (fs.existsSync(filePath)) {
          const structureData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          // Just find the first incomplete item in this roadmap
          for (const level in structureData) {
            for (const tech in structureData[level]) {
              for (const topic in structureData[level][tech]) {
                if (Array.isArray(structureData[level][tech][topic])) {
                  for (const item of structureData[level][tech][topic]) {
                    const itemText = typeof item === 'string' ? item : item.name || item.text || Object.keys(item)[0];
                    if (!otherProgress.completedItems?.[level]?.[tech]?.[topic]?.[itemText]) {
                      mostRecentRecommendations.push({
                        level,
                        tech, 
                        topic,
                        item: itemText,
                        roadmapSlug,
                        roadmapTitle: roadmapTitles[roadmapSlug] || roadmapSlug
                      });
                      
                      if (mostRecentRecommendations.length >= 3) break;
                    }
                  }
                  if (mostRecentRecommendations.length >= 3) break;
                }
              }
              if (mostRecentRecommendations.length >= 3) break;
            }
            if (mostRecentRecommendations.length >= 3) break;
          }
        }
      }
    }
    
    // Generate motivational message
    let message = "";
    if (recentRoadmapPercentage < 25) {
      message = "You're making great progress! Keep going with these next topics.";
    } else if (recentRoadmapPercentage < 50) {
      message = "You're building momentum! These topics will take your skills to the next level.";
    } else if (recentRoadmapPercentage < 75) {
      message = "You're well on your way to mastery! Tackle these topics next.";
    } else if (recentRoadmapPercentage < 100) {
      message = "You're almost there! Just a few more topics to complete your journey.";
    } else {
      message = "Try exploring a new roadmap to continue your learning journey!";
    }
    
    return res.status(200).json({
      success: true,
      data: {
        activeRoadmaps: activeRoadmaps.length,
        lastCompleted,
        recommendations: mostRecentRecommendations,
        message
      }
    });
    
  } catch (error) {
    console.error('Error generating dashboard recommendations:', error);
    res.status(500).json({ success: false, message: 'Error generating recommendations' });
  }
};