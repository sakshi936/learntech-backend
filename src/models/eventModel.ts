import mongoose, { Schema } from 'mongoose';
import { IEvent } from '../types/types'; // Import the IEvent interface


const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      default: 'Online', // Default to online if not specified
    },
    organizer: {
      type: String,
    },
    imageUrl: {
      type: String, // URL to event banner/image
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Create and export the Event model
export const EventModel = mongoose.model<IEvent>('Event', EventSchema);