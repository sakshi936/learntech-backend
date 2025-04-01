import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
slug: string;
title: string;
description: string;
time: string;
difficulty: 'beginner' | 'intermediate' | 'advanced';
preRequisites: string;
createdAt: Date;
updatedAt: Date;
}

const RoadmapSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    preRequisites: {
      type:String,
      default:"None",
    }
  },
  { timestamps: true }
);

export default mongoose.models.Roadmap || 
  mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);