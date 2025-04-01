import mongoose, { Document } from "mongoose";

export interface User extends Document {
   _id: mongoose.Types.ObjectId;
   username: string;
   email: string;
   password: string;
   verifyCode: string;
   isVerified: boolean;
   role:'student' | 'instructor' | 'admin';
   verifyCodeExpiry: Date;
}

export interface JwtPayload {
   userId: string;
   email: string;
   role: string;
   username: string;
}

export interface Progress{
   userId: User['_id'];
  roadmapSlug: string;
  completedItems: {
    [level: string]: {
      [tech: string]: {
        [topic: string]: {
          [item: string]: boolean;
        };
      };
    };
  };
  percentage: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile{
   username: string;
   email: string;
   fullName:string;
   phone:string;
   collegeName:string;
   skills:string[];
   course:string;
}