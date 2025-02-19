import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/types';


export const authenticateToken = async (
    req: Request,
    res: any,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.substring(7);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      //   console.log(decoded)
        req.user = decoded;
        next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
         return res.status(401).json({
             success: false,
             message: "Token has expired"
         });
     }
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};