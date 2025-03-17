import { Request, Response } from "express";
import UserProfileModel from "../models/userProfileModel";
import { UserProfile } from "../types/types";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.user;
    if (!username) {
      res.status(400).json({
        success: false,
        message: "Username is required",
      });
      return
    }
    const profile: UserProfile | null = await UserProfileModel.findOne({
      username,
    });
    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetched profile Successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    console.error("Error fetching profile", error);
    res.status(500).json({
      success: false,
      message: "Error Fetching User profile",
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { username, email, fullName, phone, collegeName, skills, course }:UserProfile = req.body;
    

    // Validate required fields
    if (!username || !email) {
      res.status(400).json({
        success: false,
        message: "Username and email are required",
      });
      return
    }

    // Check if profile exists
    let profile = await UserProfileModel.findOne({ username });

    if (profile) {
      // Update existing profile
      profile.fullName = fullName || profile.fullName;
      profile.phone = phone || profile.phone;
      profile.collegeName = collegeName || profile.collegeName;
      profile.skills = skills || profile.skills;
      profile.course = course || profile.course;

      await profile.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { profile },
      });
      return
    } else {
      // Create new profile
      const newProfile = new UserProfileModel({
        username,
        email,
        phone: phone || "",
        collegeName: collegeName || "",
        skills: skills || [],
        course: course || "",
      });

      await newProfile.save();

      res.status(201).json({
        success: true,
        message: "Profile created successfully",
        data: { profile: newProfile },
      });
      return
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user profile",
    });
    return
  }
};
