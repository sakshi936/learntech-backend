import mongoose,{Schema} from "mongoose";
import { Progress } from '../types/types';

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
ProgressSchema.pre('save', function(next) {
      const progress = this as Progress;
      
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

const ProgressModel =  (mongoose.models.Progress) || mongoose.model<Progress>('Progress', ProgressSchema) ;

export default ProgressModel;