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