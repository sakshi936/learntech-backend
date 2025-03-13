"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const userProfileModel_1 = __importDefault(require("../models/userProfileModel"));
const getProfile = async (req, res) => {
    try {
        const { username } = req.user;
        if (!username) {
            res.status(400).json({
                success: false,
                message: "Username is required",
            });
            return;
        }
        const profile = await userProfileModel_1.default.findOne({
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
    }
    catch (error) {
        console.error("Error fetching profile", error);
        res.status(500).json({
            success: false,
            message: "Error Fetching User profile",
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { username, email, phone, collegeName, skills, course } = req.body;
        // Validate required fields
        if (!username || !email) {
            res.status(400).json({
                success: false,
                message: "Username and email are required",
            });
            return;
        }
        // Check if profile exists
        let profile = await userProfileModel_1.default.findOne({ username });
        if (profile) {
            // Update existing profile
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
            return;
        }
        else {
            // Create new profile
            const newProfile = new userProfileModel_1.default({
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
            return;
        }
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Error updating user profile",
        });
        return;
    }
};
exports.updateProfile = updateProfile;
