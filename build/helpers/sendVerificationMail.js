"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
async function sendVerificationEmail(email, username, verifyCode) {
    try {
        await resend.emails.send({
            from: `LearnTech <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'LearnTech Verification Code',
            html: `<strong>hello ${username} <br/> Verificaton Code : ${verifyCode}</strong>`,
        });
        return { success: true, message: "Verification email sent" };
    }
    catch (emailError) {
        console.error("Error sending verification email", emailError);
        return { success: false, message: "Error sending verification email" };
    }
}
