import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../helpers/sendVerificationMail";
import { Request, Response } from "express";
import UserModel from "../models/userModel";
import jwt from "jsonwebtoken";
import { JwtPayload, User, UserProfile } from "../types/types";
import UserProfileModel from "../models/userProfileModel";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role }: User = req.body;
    // Check for existing verified user with same username
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 100);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        isVerified: false,
        role,
        verifyCodeExpiry: expiryDate,
      });
      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      res.status(500).json({
        success: false,
        message: emailResponse.message,
      });
    }

    res.status(201).json({
      success: true,
      message:
        "User registered successfully, Please verify your email to login",
    });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
    });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { email, otp } = await req.body;
    // console.log(email,otp);
    const decodedEmail = decodeURIComponent(email);
    const user = await UserModel.findOne({ email: decodedEmail });
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
    }
    const isCodeValid = user.verifyCode === otp;
    const isCodeNotExpired = new Date() < new Date(user.verifyCodeExpiry);
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      const userProfile = new UserProfileModel({
        username: user.username,
        email: user.email,
      });
      await userProfile.save();
      res.status(200).json({ message: "User verified", success: true });
    } else if (!isCodeValid) {
      res.status(400).json({ message: "Invalid code", success: false });
    } else if (!isCodeNotExpired) {
      res.status(400).json({ message: "Code expired", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error", success: false });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message: "User not verified",
      });
    }
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
    };

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1y",
      algorithm: "HS256",
    });
    // console.log(token)
    // console.log(user)
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in user", error);
    res.status(500).json({
      success: false,
      message: "Error logging in user",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if(!user.isVerified){
        res.status(403).json({
            success:false,
            message:"User not verified, please register again"
        })
        return
    }
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour from now
    // Update user with reset code
    user.verifyCode = resetCode;
    user.verifyCodeExpiry = expiryDate;
    await user.save();

    // Send email with reset code
    const emailResponse = await sendVerificationEmail(
      email,
      user.username,
      resetCode
    );
    if (!emailResponse.success) {
      res.status(500).json({
        success: false,
        message: emailResponse.message,
      });
    }
    res.status(200).json({
      success: true,
      message: "Reset code sent to email",
    });
    return;
  } catch (error) {
    console.error("Error processing forgot password request", error);
    res.status(500).json({
      success: false,
      message: "Error processing your request",
    });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const decodedEmail = decodeURIComponent(email);
    const user = await UserModel.findOne({ email: decodedEmail });
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
    }
    const isCodeValid = user.verifyCode === otp;
    const isCodeNotExpired = new Date() < new Date(user.verifyCodeExpiry);

    
    if (!isCodeValid) {
        res.status(400).json({
          success: false,
          message: "Invalid reset code"
        });
        return 
      }
      
    if (!isCodeNotExpired) {
        res.status(400).json({
          success: false,
          message: "Reset code has expired"
        });
        return 
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verifyCode = "######";
    user.verifyCodeExpiry = new Date(0); // Clear the reset code and expiry date
    await user.save();
    
    res.status(200).json({ message: "Password reset successfully", success: true });
  
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error", success: false });
  }
};
