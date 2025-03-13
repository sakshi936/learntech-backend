import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/types';


export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.substring(7);
        if (!token) {
            res.status(401).json({
                success: false,
                message: "No token provided"
            });
            return
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      //   console.log(decoded)
        req.user = decoded;
        next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
         res.status(401).json({
             success: false,
             message: "Token has expired"
         });
     }
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};