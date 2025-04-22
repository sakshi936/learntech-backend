import mongoose, { Schema } from 'mongoose';
import { IEventQuestion } from '../types/types';

// Create the Question schema
const EventQuestionSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    answer: {
      type: String,
      default: "", // Empty string by default
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: {
      type: [String], // Array of user IDs who upvoted the question
      default: [],
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Create and export the Question model
export const EventQuestionModel = mongoose.model<IEventQuestion>('EventQuestion', EventQuestionSchema);