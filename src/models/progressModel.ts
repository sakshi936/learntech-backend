import mongoose,{Schema} from "mongoose";
import { Progress } from '../types/types';

const ProgressSchema:Schema<Progress> = new Schema({
      username: {type: String, required: true,trim: true},
      roadmapSlug: {type: String, required:true},
      completed: {type: Boolean, default: false},
      current: {type: String, required: true},
      lastUpdated: {type: Date, default: Date.now},
      nextTopics: {type: [String], required: true},
      startDate: {type: Date, default: Date.now}
});

const ProgressModel =  (mongoose.models.Progress) || mongoose.model<Progress>('Progress', ProgressSchema) ;

export default ProgressModel;