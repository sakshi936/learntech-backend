"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.verify = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sendVerificationMail_1 = require("../helpers/sendVerificationMail");
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userProfileModel_1 = __importDefault(require("../models/userProfileModel"));
const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Check for existing verified user with same username
        const existingUserVerifiedByUsername = await userModel_1.default.findOne({
            username,
            isVerified: true,
        });
        if (existingUserVerifiedByUsername) {
            res.status(400).json({
                success: false,
                message: "Username already exists",
            });
        }
        const existingUserByEmail = await userModel_1.default.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                res.status(400).json({
                    success: false,
                    message: "Email already exists",
                });
            }
            else {
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        }
        else {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 100);
            const newUser = new userModel_1.default({
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
        const emailResponse = await (0, sendVerificationMail_1.sendVerificationEmail)(email, username, verifyCode);
        if (!emailResponse.success) {
            res.status(500).json({
                success: false,
                message: emailResponse.message,
            });
        }
        res.status(201).json({
            success: true,
            message: "User registered successfully, Please verify your email to login",
        });
    }
    catch (error) {
        console.error("Error registering user", error);
        res.status(500).json({
            success: false,
            message: "Error registering user",
        });
    }
};
exports.register = register;
const verify = async (req, res) => {
    try {
        const { email, otp } = await req.body;
        // console.log(email,otp);
        const decodedEmail = decodeURIComponent(email);
        const user = await userModel_1.default.findOne({ email: decodedEmail });
        if (!user) {
            res.status(404).json({ message: "User not found", success: false });
        }
        const isCodeValid = user.verifyCode === otp;
        const isCodeNotExpired = new Date() < new Date(user.verifyCodeExpiry);
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            const userProfile = new userProfileModel_1.default({
                username: user.username,
                email: user.email,
            });
            await userProfile.save();
            res.status(200).json({ message: "User verified", success: true });
        }
        else if (!isCodeValid) {
            res.status(400).json({ message: "Invalid code", success: false });
        }
        else if (!isCodeNotExpired) {
            res.status(400).json({ message: "Code expired", success: false });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error", success: false });
    }
};
exports.verify = verify;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.default.findOne({ email });
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
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            username: user.username,
        };
        // Sign JWT
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
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
    }
    catch (error) {
        console.error("Error logging in user", error);
        res.status(500).json({
            success: false,
            message: "Error logging in user",
        });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (!user.isVerified) {
            res.status(403).json({
                success: false,
                message: "User not verified, please register again"
            });
            return;
        }
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date(Date.now() + 3600000); // 1 hour from now
        // Update user with reset code
        user.verifyCode = resetCode;
        user.verifyCodeExpiry = expiryDate;
        await user.save();
        // Send email with reset code
        const emailResponse = await (0, sendVerificationMail_1.sendVerificationEmail)(email, user.username, resetCode);
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
    }
    catch (error) {
        console.error("Error processing forgot password request", error);
        res.status(500).json({
            success: false,
            message: "Error processing your request",
        });
        return;
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const decodedEmail = decodeURIComponent(email);
        const user = await userModel_1.default.findOne({ email: decodedEmail });
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
            return;
        }
        if (!isCodeNotExpired) {
            res.status(400).json({
                success: false,
                message: "Reset code has expired"
            });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        user.verifyCode = "######";
        user.verifyCodeExpiry = new Date(0); // Clear the reset code and expiry date
        await user.save();
        res.status(200).json({ message: "Password reset successfully", success: true });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error", success: false });
    }
};
exports.resetPassword = resetPassword;
