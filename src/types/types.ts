export interface User extends Document {
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
   username: string;
   roadmapSlug: string;
   completed: boolean;
   current: string;
   lastUpdated: Date;
   nextTopics: string[];
   startDate: Date;
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