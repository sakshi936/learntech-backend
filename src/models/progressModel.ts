import mongoose,{Schema} from "mongoose";
import { Progress } from '../types/types';
import RoadmapModel from "./roadmapModel";
import fs from 'fs';
import path from 'path';


const ProgressSchema:Schema<Progress> = new Schema(
      {
    userId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.Mixed,
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
  },
  { timestamps: true }
);

// Pre-save middleware to calculate percentage
ProgressSchema.pre('save', async function(next) {
  try {
    const progress = this as Progress;
    
    // Get the roadmap data based on the slug
    const roadmap = await RoadmapModel.findOne({ slug: progress.roadmapSlug });
    
    if (!roadmap) {
      // If roadmap not found, proceed without changing percentage
      next();
      return;
    }
    const filePath = path.join(process.cwd(), 'src','data', 'roadmaps', `${roadmap.slug}.json`);

     if (!fs.existsSync(filePath)) {
          throw new Error(`Roadmap structure file not found: ${filePath}`);
        }

    const structureData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
  } catch (error:any) {
    next(error);
  }
});

const ProgressModel =  (mongoose.models.Progress) || mongoose.model<Progress>('Progress', ProgressSchema) ;

export default ProgressModel;